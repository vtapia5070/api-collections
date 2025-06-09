import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CatsService } from './cats.service';

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let catsService: CatsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    catsService = app.get(CatsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/cats (GET) should return paginated cats', async () => {
    const response = await request(app.getHttpServer())
      .get('/cats')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
  });

  it('/cats (GET) should return 200 with empty array if no cats found', async () => {
    jest
      .spyOn(catsService, 'findAll')
      .mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 });
    const response = await request(app.getHttpServer())
      .get('/cats')
      .expect(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.total).toBe(0);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
  });

  it('/cats (GET) should return 400 for invalid query params', async () => {
    const response = await request(app.getHttpServer())
      .get('/cats?limit=notanumber')
      .expect(400);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
