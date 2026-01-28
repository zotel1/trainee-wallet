import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService - login', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock.user.findUnique.mockReset();
    jwtMock.signAsync.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should return access_token when credentials are valid', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@test.com',
      password: passwordHash,
      role: 'USER',
      createdAt: new Date(),
    });

    jwtMock.signAsync.mockResolvedValue('token123');

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({ access_token: 'token123' });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(1);
  });

  it('should throw 401 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@test.com', password: '123456' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw 401 when password is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@test.com',
      password: await bcrypt.hash('otro', 10),
      role: 'USER',
      createdAt: new Date(),
    });

    await expect(
      service.login({ email: 'test@test.com', password: '123456' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
