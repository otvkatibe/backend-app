import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default_secret';

export const sign = (payload: object): string => {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verify = (token: string): any => {
    return jwt.verify(token, SECRET);
};
