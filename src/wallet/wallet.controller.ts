import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('account')
  @UseGuards(JwtAuthGuard)
  createAccount(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.walletService.createAccountForUser(user.userId);
  }
}
