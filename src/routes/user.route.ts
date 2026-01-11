import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authorize } from '../middlewares/authorize';


const userRoute = Router();
const userController = new UserController();

userRoute.post('/users', userController.create);
userRoute.post('/login', userController.login);
userRoute.get('/admin/stats', ensureAuthenticated, authorize(['ADMIN']), (req, res) => {
    return res.json({ status: 'open' });
});

export default userRoute;
