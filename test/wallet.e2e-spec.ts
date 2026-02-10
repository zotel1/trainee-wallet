import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupUserData } from './helpers/cleanup';
import { registerAndLogin } from './helpers/auth';

type ServerLike = Parameters<typeof request>[0];

type AccountResponse = {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
};

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ServerLike;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    server = app.getHttpServer() as ServerLike;
  });

  afterEach(async () => {
    await cleanupUserData(prisma, createdUserIds);
    createdUserIds.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /wallet/account -> 401 without token', async () => {
    await request(server).post('/wallet/account').expect(401);
  });

  it('POST /wallet/account -> 201 creates account for authenticated user', async () => {
    const { token, userId } = await registerAndLogin(app, 'wallet');
    createdUserIds.push(userId);

    const res = await request(server)
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const body = res.body as AccountResponse;

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('userId');
    expect(body.balance).toBe(0);
  });

  it('POST /wallet/account -> 409 if account already exists', async () => {
    const { token, userId } = await registerAndLogin(app, 'walletdup');
    createdUserIds.push(userId);

    await request(server)
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(server)
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });
});
