import express from "express";
import { addCartProduct, addProduct, deleteAllCategories, deleteAllProducts, deleteBatchProducts, deleteCategory, deleteProduct, getAllCategories, getAllProducts, getProduct, pagination, updateCategory, updateProduct, getAllCartProducts, getUserCartId, updateQuantity, deleteUserCart, orderPlace } from "../../controller/productController.js";
import authuser from "../../middlewares/user/authuser.js";
import multer from 'multer'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productRouter = express.Router();
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase())
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },// 5 MB limit
}).single('productimg');

productRouter.get('/', (req, res, next) => {
    res.send('product router working.');
});

productRouter.post('/addProduct', (req, res, next) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            console.log('multer registration req.file: ', req.file);
            console.log('multer registration req.body: ', req.body);

            next();
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal error' });
    }
}, addProduct);
productRouter.post('/addCartProduct',authuser, addCartProduct);
productRouter.get('/getUserCartId', authuser, getUserCartId);
productRouter.delete('/deleteUserCart/:id', authuser, deleteUserCart);
productRouter.get('/getAllCartProducts', authuser, getAllCartProducts);
productRouter.patch('/updateQuantity/:id', authuser, updateQuantity);
productRouter.get('/getAllProducts', getAllProducts);
productRouter.get('/getAllCategories', getAllCategories);
productRouter.get('/getProduct/:id', getProduct);
productRouter.delete('/deleteProduct/:id', deleteProduct);
productRouter.delete('/deleteCategory/:id', deleteCategory);
productRouter.delete('/deleteAllProducts', deleteAllProducts);
productRouter.delete('/deleteAllCategories', deleteAllCategories);
productRouter.delete('/deleteBatchProducts', deleteBatchProducts);
productRouter.patch('/updateProduct/:id', updateProduct);
productRouter.patch('/updateCategory/:id', updateCategory);
productRouter.post('/pagination', pagination);
productRouter.post('/orderPlace', orderPlace);

export default productRouter;