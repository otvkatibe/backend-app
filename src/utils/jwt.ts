import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const getSecret = () => {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }
    return process.env.JWT_SECRET || 'dev_secret_unsafe';
};

const getRefreshSecret = () => {
    return process.env.JWT_REFRESH_SECRET || getSecret();
};

export type Role = 'USER' | 'ADMIN';

export interface TokenPayload {
    id: string;
    role: Role;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign({ ...payload, jti: uuidv4() }, getSecret(), { expiresIn: '15m' }); // Short-lived
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign({ ...payload, jti: uuidv4() }, getRefreshSecret(), {
        expiresIn: '7d',
    }); // Long-lived
};

// Legacy support alias if needed or just replace usages
export const sign = (payload: TokenPayload): string => generateAccessToken(payload);

export const verify = (token: string, isRefresh = false): TokenPayload => {
    return jwt.verify(token, isRefresh ? getRefreshSecret() : getSecret()) as TokenPayload;
};
