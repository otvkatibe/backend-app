import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default_secret';

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
