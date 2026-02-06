import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupUserData } from './helpers/cleanup';
import { registerAndLogin } from './helpers/auth';

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await cleanupUserData(prisma, createdUserIds);
    createdUserIds.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /wallet/account -> 401 without token', async () => {
    await request(app.getHttpServer()).post('/wallet/account').expect(401);
  });

  it('POST /wallet/account -> 201 creates account for authenticated user', async () => {
    const { token, userId } = await registerAndLogin(app, 'wallet');
    createdUserIds.push(userId);

    const res = await request(app.getHttpServer())
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('userId');
    expect(res.body.balance).toBe(0);
  });

  it('POST /wallet/account -> 409 if account already exists', async () => {
    const { token, userId } = await registerAndLogin(app, 'walletdup');
    createdUserIds.push(userId);

    await request(app.getHttpServer())
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });
});
