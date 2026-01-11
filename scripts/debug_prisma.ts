import { Prisma } from '@prisma/client';

console.log('Keys in Prisma namespace object:', Object.keys(Prisma));

try {
    // @ts-ignore
    console.log('PrismaClientKnownRequestError:', Prisma.PrismaClientKnownRequestError);
} catch (e) {
    console.log('Error accessing known request error:', e);
}
