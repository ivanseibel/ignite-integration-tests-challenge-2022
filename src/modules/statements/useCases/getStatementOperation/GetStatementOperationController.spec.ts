
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'Jon Doe',
      email: 'johndoe@email.com',
      password: '1234',
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get the statement operation', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@email.com',
      password: '1234',
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit test',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  it('should not be able to get the statement operation with a non-existent user', async () => {
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
