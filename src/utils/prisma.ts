import 'dotenv/config';
import { PrismaClient } from '@prisma/client';


if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL nao esta definida em process.env');
} else {
    console.log('DATABASE_URL esta presente. Comeca com:', process.env.DATABASE_URL.substring(0, 11) + '...');
}

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
