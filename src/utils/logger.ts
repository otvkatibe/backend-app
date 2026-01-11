import { WinstonLogger } from '../adapters/WinstonLogger';
import { Logger } from '../ports/Logger';

// Singleton instance
export const logger: Logger = new WinstonLogger();
