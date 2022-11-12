import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;

describe('Get Balance Controller', () => {
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

  it('should be able to get the balance', async () => {


    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@email.com',
      password: '1234',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body).toHaveProperty('balance');
  });

  it('should not be able to get the balance with a non-existent user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'non-existent',
      password: '1234',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });
});
