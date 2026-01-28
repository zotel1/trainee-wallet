import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type LoginResponse = { access_token: string };

describe('Auth JWT (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: unknown;

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
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> login -> /auth/me returns 200 with user payload', async () => {
    await request(server as Parameters<typeof request>[0])
      .post('/auth/register')
      .send({ email: 'me@test.com', password: '123456' })
      .expect(201);

    const loginRes = await request(server as Parameters<typeof request>[0])
      .post('/auth/login')
      .send({ email: 'me@test.com', password: '123456' })
      .expect(201);

    const loginBody = loginRes.body as LoginResponse;
    expect(typeof loginBody.access_token).toBe('string');

    const meRes = await request(server as Parameters<typeof request>[0])
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.access_token}`)
      .expect(200);

    expect(meRes.body).toMatchObject({
      email: 'me@test.com',
      role: 'USER',
    });
    expect(meRes.body).toHaveProperty('userId');
  });

  it('/auth/me without token returns 401', async () => {
    await request(server as Parameters<typeof request>[0])
      .get('/auth/me')
      .expect(401);
  });

  it('/auth/me with invalid token returns 401', async () => {
    await request(server as Parameters<typeof request>[0])
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });
});
