import { Test } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('WalletService - createAccountForUser', () => {
  let service: WalletService;

  const prismaMock = {
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock.account.findUnique.mockReset();
    prismaMock.account.create.mockReset();

    const module = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(WalletService);
  });

  it('should create account if user has none', async () => {
    prismaMock.account.findUnique.mockResolvedValue(null);

    prismaMock.account.create.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      balance: 0,
    });

    const account = await service.createAccountForUser('user-1');

    expect(prismaMock.account.create).toHaveBeenCalledTimes(1);
  });

  it('should throw 409 if user already has account', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      balance: 100,
    });

    await expect(service.createAccountForUser('user-1'),
).rejects.toBeInstanceOf(ConflictException);
  });
});
