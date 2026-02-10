import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { registerAndLogin } from './helpers/auth';
import { cleanupUserData } from './helpers/cleanup';

type ServerLike = Parameters<typeof request>[0];

type MeResponse = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

describe('Auth JWT (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ServerLike;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

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

  it('register -> login -> /auth/me returns 200 with user payload', async () => {
    const { token, email, userId } = await registerAndLogin(app, 'me');
    createdUserIds.push(userId);

    const meRes = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = meRes.body as MeResponse;

    expect(body).toMatchObject({
      email,
      role: 'USER',
    });
    expect(body).toHaveProperty('userId');
  });

  it('/auth/me without token returns 401', async () => {
    await request(server).get('/auth/me').expect(401);
  });

  it('/auth/me with invalid token returns 401', async () => {
    await request(server)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });
});
