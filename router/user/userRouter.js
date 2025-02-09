import express from "express";
import { about, createData, deleteUser, getAllData, getUser, login, logout, updateUser } from "../../controller/userController.js";
import authuser from "../../middlewares/user/authuser.js";

const userRouter = express.Router();

userRouter.get('/', (req, res, next) => {
    res.send('user working well.');
});

userRouter.post('/createData', createData);
userRouter.get('/getAllData', getAllData);
userRouter.delete('/deleteUser/:id', deleteUser);
userRouter.get('/getUser', authuser, getUser);
userRouter.patch('/updateUser/:id', authuser, updateUser);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.get('/about', authuser, about);

export default userRouter;