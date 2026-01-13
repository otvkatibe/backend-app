import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required in production.",
  );
}

const SECRET = process.env.JWT_SECRET || "dev_secret_unsafe";
// Refresh secret should ideally be different, strictly enforcing separation.
// For now, using same secret but ideally process.env.JWT_REFRESH_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || SECRET;

export type Role = "USER" | "ADMIN";

export interface TokenPayload {
  id: string;
  role: Role;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: uuidv4() }, SECRET, { expiresIn: "15m" }); // Short-lived
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: uuidv4() }, REFRESH_SECRET, {
    expiresIn: "7d",
  }); // Long-lived
};

// Legacy support alias if needed or just replace usages
export const sign = (payload: TokenPayload): string =>
  generateAccessToken(payload);

export const verify = (token: string, isRefresh = false): TokenPayload => {
  return jwt.verify(token, isRefresh ? REFRESH_SECRET : SECRET) as TokenPayload;
};
