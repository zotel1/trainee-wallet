import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

type ServerLike = Parameters<typeof request>[0];

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: ServerLike;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer() as ServerLike;
  });

  it('/ (GET)', async () => {
    await request(server).get('/').expect(200).expect('Hello World!');
  });
});
