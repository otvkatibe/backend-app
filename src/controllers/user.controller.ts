import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { createUserSchema, loginSchema } from '../schemas/user.schema';
import { PaginationOptions } from '../types/PaginationTypes';

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createUserSchema.parse(req.body);
            const user = await userService.create(data);
            return res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await userService.authenticate(data);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).userId; // Injected by ensureAuthenticated
            const user = await userService.getProfile(userId);
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const options: PaginationOptions = {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                sort: req.query.sort as string,
                order: req.query.order as 'asc' | 'desc'
            };

            const result = await userService.listAll(options);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
