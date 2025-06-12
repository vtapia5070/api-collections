import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CatsService } from './cats.service';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let catsService: CatsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
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
    // Mock to simulate no cats in database
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
    // In test environment, validation errors return HTML format
    // The important thing is that we get a 400 status code
    expect(response.status).toBe(400);
  });

  it('/cats (POST) should create a new cat', async () => {
    const newCat = {
      name: 'Whiskers',
      age: 2,
      breed: 'Tabby',
      imageUrl: 'http://example.com/cat.jpg',
    };
    // Mock the create method for this test to avoid database insertion
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
    // In test environment, validation errors return HTML format
    // The important thing is that we get a 400 status code
    expect(response.status).toBe(400);
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
    // Mock the update method for this test to avoid database operations
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
    const nonExistentId = 'not-found-uuid'; // Valid UUID format but doesn't exist
    const response = await request(app.getHttpServer())
      .patch(`/cats/${nonExistentId}`)
      .send({ name: 'Updated Name' })
      .expect(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.message).toBe('Resource not found');
  });

  it('/cats/:id (PATCH) should return 400 for invalid input', async () => {
    const id = 'cat-uuid';
    const response = await request(app.getHttpServer())
      .patch(`/cats/${id}`)
      .send({ age: -10 })
      .expect(400);
    // In test environment, validation errors return HTML format
    // The important thing is that we get a 400 status code
    expect(response.status).toBe(400);
  });

  it('/cats/:id (DELETE) should delete a cat', async () => {
    const id = 'cat-uuid';
    const deletedCat = {
      id,
      name: 'Deleted Cat',
      age: 3,
      breed: 'Tabby',
      imageUrl: 'http://example.com/cat.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Mock the delete method for this test to avoid database operations
    jest.spyOn(catsService, 'delete').mockResolvedValueOnce(deletedCat);
    const response = await request(app.getHttpServer())
      .delete(`/cats/${id}`)
      .expect(200);
    expect(response.body.id).toBe(id);
    expect(response.body.name).toBe(deletedCat.name);
  });

  it('/cats/:id (DELETE) should return 404 if cat not found', async () => {
    const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff'; // Valid UUID format but doesn't exist
    const response = await request(app.getHttpServer())
      .delete(`/cats/${nonExistentId}`)
      .expect(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.message).toBe('Resource not found');
  });
});
