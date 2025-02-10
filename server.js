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
// Allow both local development and production frontend
const allowedOrigins = [
    "http://localhost:5173",  // Local development
    "https://frontend1-5hsb.onrender.com/"  // Deployed frontend on Render
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    credentials: true, // Allow cookies, authorization headers
    optionsSuccessStatus: 200 // Fixes issues with some legacy browsers
};

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
