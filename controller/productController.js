import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import dotenv from 'dotenv';
import { validateProduct } from '../validations/product/validateproduct.js';
import { validateCardProduct } from '../validations/product/validateCartProduct.js';
import { validateOrderPlace } from '../validations/product/validateOrderPlace.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const prisma = new PrismaClient();

// add new product 
export const addProduct = async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        console.log('req.file: ', req.file);
        // const { productData, selectValue } = req.body;

        // console.log('productData: ', productData);
        // console.log('selectValue: ', selectValue);

        // const newdata = { ...productData, categoryName: selectValue }
        // joi validation for incoming data from frontend
        const { error, value } = validateProduct(req.body);

        if (error) {
            console.log('error create: ', error);
            return res.status(500).json({ error });
        }
        else {
            console.log("Validated Data,", value);

            const { name, description, price, stock, brand, ratings, categoryName } = value;

            // duplicate product check
            const product = await prisma.product.findUnique({
                where: { name }
            });

            console.log('duplicate product data found: ', product);

            if (product) {
                return res.status(400).json({ message: 'same product already exists' })
            }

            //duplicate category check
            // const oldcategoryid = await prisma.category.findUnique({
            //     where: { name: categoryName }
            // });

            // if (oldcategoryid) {
            //     console.log('duplicate category data found:', oldcategoryid);
            //     return res.status(200).json({ message: "category already exists." });
            // }
            let productimg;

            if (!req.file) {/// no image selects, req.file = {} empty object
                productimg = 'no-image';
            }
            else {// image selects
                productimg = req.file.filename;
            }
            console.log('productimg: ', typeof productimg, productimg);

            const findcategory = await prisma.category.findFirst({
                where: {
                    name: categoryName,
                },
            });
            console.log('category id:', findcategory);

            const newproduct = await prisma.product.create({
                data: {
                    name,
                    description,
                    brand,
                    price: parseFloat(price),
                    ratings,
                    stock: stock || 0,
                    category: { connect: { id: findcategory.id } },
                    productimg
                }
            });
            console.log('newproduct: ', newproduct);
            return res.status(201).json({ message: 'product added successfully.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};

// get all the products data from database
export const getAllProducts = async (req, res, next) => {
    try {
        const allproducts = await prisma.product.findMany();
        console.log('allproducts: ', allproducts);
        return res.status(200).json({ message: allproducts });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: err });
    }
};

// get all the categories data from database
export const getAllCategories = async (req, res, next) => {
    try {
        const allcategories = await prisma.category.findMany();
        console.log('allcategories: ', allcategories);
        return res.status(200).json({ message: allcategories });
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
};

// get a product by id
export const getProduct = async (req, res, next) => {
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

            // retreive the entered id product
            const getid = await prisma.product.findFirst({
                where: { id }
            });
            console.log('product id details: ', getid);

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            // const token = req.cookies.jwt_token;

            // if (!token) {
            //     console.log('no token access.');
            //     return res.json({ message: 'invalid credentials.' });
            // }
            // console.log('token: ', token, 'typeof: ', typeof token)
            return res.status(200).json({ message: getid });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// add products to the cart
export const addCartProduct = async (req, res, next) => {
    try {
        const id = req.user.id;
        console.log('id: ', id);
        console.log('req.body: ', req.body);
        const { error, value } = validateCardProduct(req.body);

        if (error) {
            console.log(error);
            return res.status(400).json({ error });
        }
        else {
            console.log("Validated Data,", value);
            const { p_id, price, quantity, stock, productName } = value;

            if (quantity === null && quantity <= 0) {
                console.log('no quantity entered');
                return res.status(400).json({ message: 'no quantity entered' });
            }

            // if same user add same product again
            const user = await prisma.cart.findFirst({
                where: { productName }
            });

            if (user) {
                console.log('user: ', user)
                await prisma.cart.update({
                    where: { id: user.id },
                    data: { quantity: user.quantity + quantity }
                });

                return res.status(200).json({ message: 'quantity updated.' });
            }

            // add to cart query
            const cartProduct = await prisma.cart.create({
                data: {
                    productName,
                    price: parseFloat(price),
                    user_id: id, quantity, stock, p_id
                }
            });
            console.log('cart details: ', cartProduct);

            return res.status(200).json({ message: 'product added.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// update quantity of product
export const updateQuantity = async (req, res, next) => {
    try {
        console.log('quantity update id: ', req.params.id);
        const id = Number(req.params.id);
        console.log('req.body cart quantity: ', req.body);

        const user = await prisma.cart.findFirst({
            where: { id }
        });
        console.log('old user quantity: ', user);
        const updatequantity = await prisma.cart.update({
            where: { id },
            data: { quantity: Number(req.body.quantity) }
        });

        console.log('update quantity: ', updatequantity);
        return res.status(200).json({ message: 'quantity updated.' });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

//get user cart id
export const getUserCartId = async (req, res, next) => {
    try {
        const id = req.user.id;
        console.log('get user cart id: ', id);
        return res.status(200).json({ message: id });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

//delete user cart
export const deleteUserCart = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        console.log('delete user cart id: ', id);

        const usercartdelete = await prisma.cart.delete({
            where: { id }
        });
        console.log('usercartdelete: ', usercartdelete);
        return res.status(200).json({ message: 'product from cart has been deleted.' });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// get all cart products
export const getAllCartProducts = async (req, res, next) => {
    try {
        const id = Number(req.user.id);
        console.log('user id for cart products: ', id);

        const usercart = await prisma.cart.findMany({
            where: { user_id: id }
        });

        console.log('user cart details: ', usercart);

        return res.status(200).json({ message: usercart });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// delete product by id
export const deleteProduct = async (req, res, next) => {
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
            const getid = await prisma.product.findFirst({
                where: { id }
            });

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            const deleteproduct = await prisma.product.delete({
                where: { id }
            });

            return res.status(200).json({ message: deleteproduct });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// delete category by id
export const deleteCategory = async (req, res, next) => {
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
            const getid = await prisma.category.findFirst({
                where: { id }
            });

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            const deletecategory = await prisma.category.delete({
                where: { id }
            });

            return res.status(200).json({ message: deletecategory });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// delete all products
export const deleteAllProducts = async (req, res, next) => {
    try {
        const deleteallproducts = await prisma.product.deleteMany();
        return res.status(200).json({ message: deleteallproducts });

    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// delete all categories
export const deleteAllCategories = async (req, res, next) => {
    try {
        const deleteallcategories = await prisma.category.deleteMany();
        return res.status(200).json({ message: deleteallcategories });

    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// delete all product in batching
export const deleteBatchProducts = async (req, res, next) => {
    try {
        console.log(req.body)
        const { product } = req.body;
        console.log('batch delete products: ', product);

        const deleteallproducts = await prisma.product.deleteMany({
            where: {
                categoryId: {
                    in: product
                }
            }
        }
        );
        console.log(deleteallproducts);
        return res.status(200).json({ message: deleteallproducts });

    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// update the product data by id
export const updateProduct = async (req, res, next) => {
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
            const getid = await prisma.product.findFirst({
                where: { id }
            });

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            const { name, description, price, stock, brand } = req.body;
            const updateproduct = await prisma.product.update({
                where: { id },
                data: { name, description, price, stock, brand }
            });
            return res.status(200).json({ message: updateproduct });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// update the category data by id
export const updateCategory = async (req, res, next) => {
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
            const getid = await prisma.category.findUnique({
                where: { id }
            });

            if (getid === null) {
                console.log(getid);
                return res.status(500).json({ message: 'wrong id.' });
            }

            const { name } = req.body;
            const updatecategory = await prisma.category.update({
                where: { id },
                data: { name }
            });
            return res.status(200).json({ message: updatecategory });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// pagination for products
export const pagination = async (req, res, next) => {
    try {
        let { curPage, itemPage } = req.body;
        console.log('currentPage: ', curPage, 'itemsPerPage: ', itemPage);

        curPage = parseInt(curPage);
        itemPage = parseInt(itemPage);

        // calculate skip value based on above data
        const skip = (curPage - 1) * itemPage;

        const deleteallcategories = await prisma.product.findMany({
            skip,
            take: itemPage
        });

        let pageCount = await prisma.product.count();
        pageCount = Math.ceil(pageCount / itemPage);

        return res.status(200).json({ message: deleteallcategories, pageCount: pageCount });

    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// add orderplace details
export const orderPlace = async (req, res, next) => {
    try {
        console.log('order place req.body: ', req.body);
        const { error, value } = validateOrderPlace(req.body);

        if (error) {
            console.log(error);
            let str = error.details.map(err => err.message);
            str = str.join(', ');
            console.log('str: ', str);
            return res.status(400).json({ message: str });
        }
        else {
            console.log("Validated Data,", value);
            const { cart_id, p_id, user_id, price, quantity } = value;

            const deletecartproduct = await prisma.cart.delete({
                where: { id: cart_id }
            });
            console.log('deletecartproduct:', deletecartproduct);

            const orderplacedetails = await prisma.OrderPlace.create({
                data: {
                    price: parseFloat(price),
                    user_id, quantity, p_id
                }
            });
            console.log('cart details: ', orderplacedetails);

            return res.status(200).json({ message: 'your order has been placed.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}