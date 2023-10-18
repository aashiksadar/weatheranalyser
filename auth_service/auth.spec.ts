const request = require('supertest');
const app = require('./auth_service.js'); // Import your Express app
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const validCredentials = { username: 'james', password: 'bond' };
const invalidCredentials = { username: 'invalid', password: 'invalid' };

const {SECRET_KEY} = process.env;
describe('Authentication Service Tests', () => {
  it('should generate a JWT token when valid credentials are provided', async () => {
    const response = await request(app)
      .post('/authenticate')
      .send(validCredentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    const decoded = jwt.verify(response.body.access_token, SECRET_KEY);
    expect(decoded.username).toBe(validCredentials.username);
  });

  it('should return a 401 status for invalid credentials', async () => {
    const response = await request(app)
      .post('/authenticate')
      .send(invalidCredentials);

    expect(response.status).toBe(401);
  });
});

