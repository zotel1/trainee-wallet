import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;

  const walletServiceMock = {
    createAccountForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: walletServiceMock }],
    }).compile();

    controller = module.get(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
