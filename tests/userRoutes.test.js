const express = require('express');
const request = require('supertest');
const { expect } = require('chai');
const userRoutes = require('../routes/userRoutes');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  return app;
}

describe('User routes (integration)', () => {
  const app = makeApp();

  it('GET /api/users => 200 & array', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/users => 201 & created user', async () => {
    const payload = { userName: 'RouteUser', email: 'route@example.com', password: 'pw' };
    const res = await request(app).post('/api/users').send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.include({ userName: 'RouteUser', email: 'route@example.com' });
  });

  it('GET /api/users/1 => 200 or 404', async () => {
    const res = await request(app).get('/api/users/1');
    expect([200, 404]).to.include(res.status);
  });
});
