import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { registerAndLogin } from './helpers/auth';

type ServerLike = Parameters<typeof request>[0];

describe('Auth RBAC (e2e', () => {
  let app: INestApplication;
  let server: ServerLike;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    server = app.getHttpServer() as ServerLike;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/admin/ping -> 403 for USER token', async () => {
    const { token } = await registerAndLogin(app, 'rbacuser');

    await request(server)
      .get('/auth/admin/ping')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
