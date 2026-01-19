import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type RegisteredUserResponse = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

describe('Auth (e2e)', () => {
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

  it('POST /auth/register -> 201 and returns user without password', async () => {
    const res = await request(server as Parameters<typeof request>[0])
      .post('/auth/register')
      .send({ email: 'user1@test.com', password: '123456' })
      .expect(201);

    const body = res.body as RegisteredUserResponse;

    expect(body).toHaveProperty('id');
    expect(body.email).toBe('user1@test.com');
    expect(body).not.toHaveProperty('password');
  });

  it('POST /auth/register -> 409 if email already exists', async () => {
    await request(server as Parameters<typeof request>[0])
      .post('/auth/register')
      .send({ email: 'user1@test.com', password: '123456' })
      .expect(201);

    await request(server as Parameters<typeof request>[0])
      .post('/auth/register')
      .send({ email: 'user1@test.com', password: '123456' })
      .expect(409);
  });

  it('POST /auth/register -> 400 on invalid payload', async () => {
    await request(server as Parameters<typeof request>[0])
      .post('/auth/register')
      .send({ email: 'no-es-email', password: '123' })
      .expect(400);
  });
});
