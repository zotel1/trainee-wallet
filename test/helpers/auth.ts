import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export type LoginResponse = { access_token: string };
export type RegisterResponse = { id: string; email: string; role: string; createdAt: string };

export function uniqueEmail(prefix: string) {
  const worker = process.env.JEST_WORKER_ID ?? '0';
  return `${prefix}_${Date.now()}_${worker}@test.com`;
}

export async function registerAndLogin(app: INestApplication, prefix = 'user') {
  const email = uniqueEmail(prefix);
  const password = '123456';

  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  const loginBody = loginRes.body as LoginResponse;
  const registerBody = registerRes.body as RegisterResponse;

  return {
    email,
    password,
    userId: registerBody.id,
    token: loginBody.access_token,
  };
}
