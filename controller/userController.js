import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateUser } from '../validations/user/validateuser.js';
import { validateUserUpdate } from '../validations/user/validateUserUpdate.js';

dotenv.config();
const prisma = new PrismaClient();

// create new data for user 
export const createData = async (req, res, next) => {
    try {
        console.log('create user req.body: ', req.body);

        // joi validation for incoming data from frontend
        const { error, value } = validateUser(req.body);

        if (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
        else {
            console.log("Validated Data,", value);

            const { name, about, age, email, contact, password } = value;
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                return res.status(200).json({ message: 'same user already exists' })
            }
            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);

            const newuser = await prisma.user.create({
                data: { name, about, age, email, contact: `+${String(contact)}`, password: hashpassword }
            });
            console.log('new user account: ', newuser);

            return res.status(201).json({ message: 'user account created.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};

// get all the data from database
export const getAllData = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        console.log(users);
        return res.status(200).json({ message: users });
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
};

// delete user by id
export const deleteUser = async (req, res, next) => {
    try {
        let checkid = Joi.object({
            id: Joi.number(),
        }).options({ abortEarly: false }).validate(req.params);

        const { error, value } = checkid;

        if (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
        else {
            console.log("Validated Data,", value);
            const { id } = value;

            // check for wrong entered id
            const getid = await prisma.user.findUnique({
                where: { id }
            });

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            const deleteuser = await prisma.user.delete({
                where: { id }
            });
            return res.status(200).json({ message: deleteuser });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// get the user data by id
export const getUser = async (req, res, next) => {
    try {
        let { id } = req.user;
        console.log('user data by id: ', id);

        const getuser = await prisma.user.findUnique({
            where: { id }
        });
        return res.status(200).json({ message: getuser });
        // }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// update the user data by id
export const updateUser = async (req, res, next) => {
    try {
        console.log('user update req.body: ', req.body);
        if (req.body.password === '') {
            delete req.body.password;
        }
        const { error: er, value: val } = validateUserUpdate(req.body);

        if (er) {
            console.log(er);
            return res.status(400).json({ er });
        }
        else {
            console.log("Validated Data,", val);
            const id = req.user.id;
            console.log(typeof id, id);

            const { name, about, age, email, contact, password } = val;

            let updateuser = '';

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashpassword = await bcrypt.hash(password, salt);
                console.log('new pasword: ', hashpassword);

                updateuser = await prisma.user.update({
                    where: { id },
                    data: { password: hashpassword, name, about, age, email, contact: `+${String(contact)}` }
                });
            }
            else {
                updateuser = await prisma.user.update({
                    where: { id },
                    data: { name, about, age, email, contact: String(contact) }
                });
            }

            console.log('user data updated: ', updateuser);
            return res.status(200).json({ message: 'user data updated.' });
            // }
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// user login
export const login = async (req, res, next) => {
    try {
        console.log(req.body);

        // joi validation for incoming data from frontend
        function validateUser(user) {
            const JoiSchema = Joi.object({

                email: Joi.string()
                    .email({ tlds: { allow: ['com', 'net', 'org'] } })
                    .pattern(/@(gmail|yahoo)\.com$/)
                    .min(5)
                    .max(50)
                    .required(),

                password: Joi.string()
                    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|;:\'",.<>?/]).{8,}$'))
                    .message('Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.')
                    .max(50)
                    .required()

            }).options({ abortEarly: false });// get all the errors, not only first error

            return JoiSchema.validate(user)
        }

        const { error, value } = validateUser(req.body);

        if (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
        else {
            console.log("Validated Data,", value);

            const { email, password } = value;
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                const matchpassword = await bcrypt.compare(password, user.password);
                if (matchpassword) {

                    // access token
                    const token = jwt.sign({ id: user.id, email }, process.env.SECRETKEY, { expiresIn: '1d' });
                    res.cookie('jwt_token', token, {
                        httpOnly: true,// cannot access cookie via js
                        path: '/',// set the cookie is available from
                        secure: true,// allow cookies to be sent over sent only http
                        sameSite: 'none'// cookie can be shared over all CORS
                    });
                    console.log('accesstoken: ', token);

                    // generate refreshed token
                    const refreshedToken = jwt.sign({ email }, process.env.SECRETKEY, { expiresIn: '2d' });

                    const generatedToken = await prisma.user.update({
                        where: { email },
                        data: { refreshedToken }
                    });
                    console.log('generatedToken: ', generatedToken);

                    return res.status(200).json({ message: 'user login successfully.' });
                }
                else {
                    return res.status(500).json({ message: 'invalid credentials.' });
                }
            }
            return res.status(500).json({ message: 'invalid credentials.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};

//user logout
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('jwt_token', { path: '/' });
        return res.status(200).json({ message: 'user log out successfully.' });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};

// about the user details
export const about = async (req, res, next) => {
    try {
        console.log('logged user data.');
        return res.status(200).json({ message: req.user });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}
