import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './router/user/userRouter.js';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import cookieparse from 'cookie-parser';
import productRouter from './router/product/productRouter.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();
dotenv.config();

const server = express();
const corsOptions = {
    origin: "*",
    credentials: true, // Allow cookies, authorization headers
};
server.use(cors(corsOptions));

const options = {
    // origin: "http://localhost:5173",// only allow this URL
    credentials: true,// allow cookies over different CORS from frontend
    origin: "https://frontend1-5hsb.onrender.com", // Replace with your actual frontend URL
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
}

server.use(cors(options));
server.use(cookieparse());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// this will serve files in the uploads directory under the /uploads URL path.
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.use('/user', userRouter);
server.use('/product', productRouter);

const srvr = server.listen(process.env.PORT, () => { console.log(`server is running at ${process.env.PORT}`); });

process.on('SIGINT', async () => {// signal interrupt => SIGINT
    console.log('Shutting down server...');
    await prisma.$disconnect(); // disconnecting the prisma
    srvr.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
