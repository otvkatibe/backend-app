import { Request, Response } from "express";
import { HealthService } from "../services/health.service";

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  check = async (req: Request, res: Response) => {
    try {
      const [isDbUp, isRedisUp] = await Promise.all([
        this.healthService.checkDatabase(),
        this.healthService.checkRedis(),
      ]);

      const isHealthy = isDbUp && isRedisUp; // Strict check
      const status = isHealthy ? 200 : 503;

      const response = {
        status: isHealthy ? "UP" : "DOWN",
        timestamp: new Date().toISOString(),
        services: {
          database: isDbUp ? "UP" : "DOWN",
          redis: isRedisUp ? "UP" : "DOWN",
        },
      };

      return res.status(status).json(response);
    } catch (error) {
      console.error("Health Check Failed:", error);
      return res.status(503).json({
        status: "DOWN",
        timestamp: new Date().toISOString(),
        services: {
          database: "UNKNOWN",
          redis: "UNKNOWN",
        },
      });
    }
  };
}
