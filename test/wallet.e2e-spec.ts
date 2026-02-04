import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type LoginResponse = { access_token: string };

async function registerAndLogin(app: import('@nestjs/common').INestApplication) {
  const email = `wallet_${Date.now()}@test.com`;
  const password = '123456';

  // Register
  await request(app.getHttpServer()).post('/auth/register').send({ email, password }).expect(201);

  // Login
  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  const body = loginRes.body as LoginResponse;
  return { token: body.access_token, email };
}

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: unknown;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // En e2e no corre main.ts, por eso configuramos pipes aca
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    // limpiamos todo para que cada test sea determinístico
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /wallet/account -> 401 without token', async () => {
    await request(server as Parameters<typeof request>[0])
      .post('/wallet/account')
      .expect(401);
  });

  it('POST /wallet/account -> 201 creates account for authenticated user', async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(server as Parameters<typeof request>[0])
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('balance');
    expect(res.body.balance).toBe(0);
  });

  it('POST /wallet/account -> 409 if account already exists', async () => {
    const { token } = await registerAndLogin(app);

    await request(server as Parameters<typeof request>[0])
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(server as Parameters<typeof request>[0])
      .post('/wallet/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });
});
