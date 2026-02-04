import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [WalletService],
  controllers: [WalletController],
  imports: [PrismaModule],
})
export class WalletModule {}
