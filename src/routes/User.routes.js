import express from 'express';
import { checkAuth, LogIn, LogOut, SignUp } from '../controllers/User.controller.js';

const UserRoute = express.Router();

UserRoute.post('/signup',SignUp);
UserRoute.post('/login',LogIn);
UserRoute.get("/logout",LogOut);
UserRoute.get('/check',checkAuth);

export default UserRoute;