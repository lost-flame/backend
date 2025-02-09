import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

const authuser = async (req, res, next) => {
    const token = req.cookies.jwt_token;

    if (!token) {
        console.log('no token access.');
        return res.status(500).json({ message: 'invalid credentials.' });
    }

    const verifytoken = jwt.verify(token, process.env.SECRETKEY);
    console.log('verifytoken: ', verifytoken);

    const user = await prisma.user.findUnique({
        where: { id: verifytoken.id }
    });

    if (!user) {
        console.log('no user found.');
        return res.status(500).json({ message: 'middleare invalid credentials.' });
    }
    console.log('middleware user: ',user);
    req.user = user;
    next();// pass to the next handler/middleware
}

export default authuser;