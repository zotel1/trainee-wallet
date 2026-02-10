import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccountForUser(userId: string) {
    const existing = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Account already exists');
    }

    return this.prisma.account.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }
}
