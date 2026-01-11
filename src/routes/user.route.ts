import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authLimiter } from '../middlewares/rateLimiter';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authorize } from '../middlewares/authorize';


const userRoute = Router();
const userController = new UserController();

userRoute.post('/users', authLimiter, userController.create);
userRoute.post('/login', authLimiter, userController.login);
userRoute.get('/admin/stats', ensureAuthenticated, authorize(['ADMIN']), (req, res) => {
    return res.json({ status: 'open' });
});

export default userRoute;
