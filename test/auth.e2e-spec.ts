import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // En e2e No corre main.ts, por eso configuramos pipes aca
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    // Limpieza por test para que sean deterministicos
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register -> 201 and returns user without password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user1@latest.com', password: '123456' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('user1@test.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/register -> 409 if email', async () => {
    await request(app.getHttpServer())
      .post('/auth/')
      .send({ email: 'user1@test.com', password: '123456' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user1@test.com', password: '123456' })
      .expect(409);
  });

  it('POST /auth/register -> 400 on invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'no-es-un-email', password: '123' })
      .expect(400);
  });
});
