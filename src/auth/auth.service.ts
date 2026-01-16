import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type RegisterInput = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);

    try {
      const created = await this.prisma.user.create({
        data: {
          email: input.email,
          password: passwordHash,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return created;
    } catch (err: any) {
      // Prisma unique constraint violation (email already exists)
      if (err?.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }
}
