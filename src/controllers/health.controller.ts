import { Request, Response } from 'express';
import { HealthService } from '../services/health.service';

export class HealthController {
    private healthService: HealthService;

    constructor() {
        this.healthService = new HealthService();
    }

    check = async (req: Request, res: Response) => {
        const isDbUp = await this.healthService.checkDatabase();

        const status = isDbUp ? 200 : 503;
        const response = {
            status: isDbUp ? 'UP' : 'DOWN',
            timestamp: new Date().toISOString(),
            services: {
                database: isDbUp ? 'UP' : 'DOWN'
            }
        };

        return res.status(status).json(response);
    };
}
