import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authLimiter } from '../middlewares/rateLimiter';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authorize } from '../middlewares/authorize';


const userRoute = Router();
const userController = new UserController();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
userRoute.post('/users', authLimiter, userController.create);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */
userRoute.post('/login', authLimiter, userController.login);
userRoute.get('/admin/stats', ensureAuthenticated, authorize(['ADMIN']), (req, res) => {
    return res.json({ status: 'open' });
});

export default userRoute;
