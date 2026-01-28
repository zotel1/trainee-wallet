import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService - register', () => {
  let service: AuthService;

  const jwtMock = {
    signAsync: jest.fn(),
  };

  const prismaMock = {
    user: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock.user.create.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should register a new user', async () => {
    prismaMock.user.create.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@test.com',
      role: 'USER',
      createdAt: new Date(),
    });

    const user = await service.register({
      email: 'test@test.com',
      password: '123456',
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@test.com');
    expect(user).not.toHaveProperty('password');
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });

  it('should throw 409 if email already exists', async () => {
    const prismaUniqueError = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });

    prismaMock.user.create.mockRejectedValue(prismaUniqueError);

    await expect(
      service.register({
        email: 'test@test.com',
        password: '123456',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
