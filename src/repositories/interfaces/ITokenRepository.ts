import { RefreshToken, User } from "@prisma/client";

export interface ITokenRepository {
  create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  findByTokenWithUser(
    token: string,
  ): Promise<(RefreshToken & { user: User }) | null>;
  revoke(id: string): Promise<RefreshToken>;
}
