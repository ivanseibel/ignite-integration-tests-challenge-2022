import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '1234',
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@email.com',
      password: '1234',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

  });
});
