import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const userRoute = Router();
const userController = new UserController();

userRoute.post('/users', userController.create);
userRoute.post('/login', userController.login);
userRoute.get('/profile', ensureAuthenticated, userController.getProfile);

export default userRoute;
