import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { createUserSchema, loginSchema } from "../schemas/user.schema";
import { PaginationOptions } from "../types/PaginationTypes";
import { AppError } from "../utils/AppError";

import { PrismaUserRepository } from "../repositories/prisma/PrismaUserRepository";
import { PrismaTokenRepository } from "../repositories/prisma/PrismaTokenRepository";

const userRepository = new PrismaUserRepository();
const tokenRepository = new PrismaTokenRepository();
const userService = new UserService(userRepository, tokenRepository);

export class UserController {
  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);
    const user = await userService.create(data);
    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await userService.authenticate(data);
    return res.status(200).json(result);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }
    const result = await userService.refreshToken(refreshToken);
    return res.status(200).json(result);
  }

  async getProfile(req: Request, res: Response) {
    const userId = (req as any).userId; // Injected by ensureAuthenticated
    const user = await userService.getProfile(userId);
    return res.json(user);
  }

  async listAll(req: Request, res: Response) {
    const options: PaginationOptions = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sort: req.query.sort as string,
      order: req.query.order as "asc" | "desc",
    };

    const result = await userService.listAll(options);
    return res.json(result);
  }
}
