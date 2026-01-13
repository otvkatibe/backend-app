import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
}

const SECRET = process.env.JWT_SECRET || 'dev_secret_unsafe';

export type Role = 'USER' | 'ADMIN';

export interface TokenPayload {
    id: string;
    role: Role;
}

export const sign = (payload: TokenPayload): string => {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verify = (token: string): TokenPayload => {
    return jwt.verify(token, SECRET) as TokenPayload;
};
