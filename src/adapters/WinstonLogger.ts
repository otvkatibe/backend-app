import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Logger } from '../ports/Logger';

export class WinstonLogger implements Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
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
    }

    info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }
}
