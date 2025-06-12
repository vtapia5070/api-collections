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

  it('/cats (POST) should create a new cat', async () => {
    const newCat = {
      name: 'Whiskers',
      age: 2,
      breed: 'Tabby',
      imageUrl: 'http://example.com/cat.jpg',
    };
    jest.spyOn(catsService, 'create').mockResolvedValueOnce({
      id: 'some-uuid',
      ...newCat,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const response = await request(app.getHttpServer())
      .post('/cats')
      .send(newCat)
      .expect(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newCat.name);
    expect(response.body.breed).toBe(newCat.breed);
    expect(response.body.age).toBe(newCat.age);
    expect(response.body.imageUrl).toBe(newCat.imageUrl);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('/cats (POST) should return 400 for invalid input', async () => {
    const invalidCat = {
      name: '', // name is required and should be a non-empty string
      breed: '', // breed is required and should be a non-empty string
      age: -1, // invalid age
      imageUrl: 'not-a-url', // invalid url
    };
    const response = await request(app.getHttpServer())
      .post('/cats')
      .send(invalidCat)
      .expect(400);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it('/cats/:id (PATCH) should update a cat', async () => {
    const id = 'cat-uuid';
    const updateData = { name: 'Updated Name', age: 5 };
    const updatedCat = {
      id,
      name: 'Updated Name',
      age: 5,
      breed: 'Tabby',
      imageUrl: 'http://example.com/cat.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(catsService, 'update').mockResolvedValueOnce(updatedCat);
    const response = await request(app.getHttpServer())
      .patch(`/cats/${id}`)
      .send(updateData)
      .expect(200);
    expect(response.body.id).toBe(id);
    expect(response.body.name).toBe(updateData.name);
    expect(response.body.age).toBe(updateData.age);
  });

  it('/cats/:id (PATCH) should return 404 if cat not found', async () => {
    const id = 'not-found-uuid';
    jest.spyOn(catsService, 'update').mockImplementationOnce(() => {
      const error: any = new Error('Cat not found');
      error.status = 404;
      throw error;
    });
    const response = await request(app.getHttpServer())
      .patch(`/cats/${id}`)
      .send({ name: 'Does not matter' })
      .expect(404);
    expect(response.body.statusCode).toBe(404);
  });

  it('/cats/:id (PATCH) should return 400 for invalid input', async () => {
    const id = 'cat-uuid';
    const response = await request(app.getHttpServer())
      .patch(`/cats/${id}`)
      .send({ age: -10 })
      .expect(400);
    expect(response.body.statusCode).toBe(400);
  });
});
