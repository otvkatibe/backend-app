import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Logger } from '../ports/Logger';

export class WinstonLogger implements Logger {
    private logger: winston.Logger;

    constructor() {
        const isProduction = process.env.NODE_ENV === 'production';
        const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

        const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];

        const maskSensitiveData = winston.format((info) => {
            const mask = (obj: unknown) => {
                if (typeof obj !== 'object' || obj === null) return;
                for (const key in obj as Record<string, unknown>) {
                    if (sensitiveKeys.includes(key)) {
                        (obj as Record<string, unknown>)[key] = '***MASKED***';
                    } else if (typeof (obj as Record<string, unknown>)[key] === 'object') {
                        mask((obj as Record<string, unknown>)[key]);
                    }
                }
            };
            mask(info);
            return info;
        });

        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(maskSensitiveData(), winston.format.timestamp(), winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                    silent: isProduction,
                }),
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                }),
                new DailyRotateFile({
                    filename: 'logs/combined-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
            ],
        });

        if (isProduction) {
            this.logger.transports.find((t) => t instanceof winston.transports.Console)!.format =
                winston.format.combine(maskSensitiveData(), winston.format.timestamp(), winston.format.json());
        }
    }

    info(message: string, meta?: unknown): void {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: unknown): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: unknown): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: unknown): void {
        this.logger.debug(message, meta);
    }
}
