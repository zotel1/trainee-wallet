import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { registerAndLogin } from './helpers/auth';

type ServerLike = Parameters<typeof request>[0];

type AdminUserItem = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

describe('Auth Admin (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ServerLike;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    server = app.getHttpServer() as ServerLike;
  });

  beforeEach(async () => {
    // orden importante por FK si ya tenés Accpunt/Transaction
    await prisma.transaction.deleteMany().catch(() => undefined);
    await prisma.account.deleteMany().catch(() => undefined);
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/admin/user -> 401 without token', async () => {
    await request(server).get('/auth/admin/users').expect(401);
  });

  it('GET /auth/admin/users -> 403 with USER token', async () => {
    const { token } = await registerAndLogin(app, 'adminusers_user');

    await request(server)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /auth/admin/users -> 200 with ADMIN token and returns users', async () => {
    // 1) register & login (TOKEN USER)
    const { email, password, userId } = await registerAndLogin(app, 'admin');

    // Convertimos ese usuario en ADMIN directo en DB (solo para test)
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    // 3) login AGAIN to get a new token with role=ADMIN in the payload
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect((res) => {
        // aceptamos 200 o 201
        if (res.status !== 200 && res.status !== 201) {
          throw new Error(`Expected 200 or 201, got ${res.status}`);
        }
      });

    const adminToken = (loginRes.body as { access_token: string }).access_token;

    // $) call admin endpoint with ADMIN token
    const res = await request(server)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as AdminUserItem[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Seguridad: nunca debe venir password
    expect(body[0]).not.toHaveProperty('password');
  });
});
