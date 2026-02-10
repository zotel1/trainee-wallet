import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupUserData } from './helpers/cleanup';
import { uniqueEmail } from './helpers/auth';

type ServerLike = Parameters<typeof request>[0];

type RegisterResponse = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ServerLike;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // En e2e NO corre main.ts, por eso configuramos pipes acá
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

  it('POST /auth/register -> 201 and returns user without password', async () => {
    const email = uniqueEmail('user');

    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: '123456' })
      .expect(201);

    const body = res.body as RegisterResponse;

    createdUserIds.push(body.id);

    expect(body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/register -> 409 if email already exists', async () => {
    const email = uniqueEmail('dup');

    const res1 = await request(server)
      .post('/auth/register')
      .send({ email, password: '123456' })
      .expect(201);

    const body1 = res1.body as RegisterResponse;
    createdUserIds.push(body1.id);

    await request(server).post('/auth/register').send({ email, password: '123456' }).expect(409);
  });

  it('POST /auth/register -> 400 on invalid payload', async () => {
    await request(server)
      .post('/auth/register')
      .send({ email: 'no-es-email', password: '123' })
      .expect(400);
  });
});
