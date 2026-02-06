import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupUserData } from './helpers/cleanup';
import { uniqueEmail } from './helpers/auth';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: '123456' })
      .expect(201);

    createdUserIds.push(res.body.id);

    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/register -> 409 if email already exists', async () => {
    const email = uniqueEmail('dup');
    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: '123456' })
      .expect(201);

    createdUserIds.push(res1.body.id);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: '123456' })
      .expect(409);
  });

  it('POST /auth/register -> 400 on invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'no-es-email', password: '123' })
      .expect(400);
  });
});
