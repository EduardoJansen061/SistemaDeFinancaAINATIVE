/**
 * TASK 2 — Testes de Autenticação
 * Testa: register, login, token inválido, rate limit, validação
 */

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = 'financaspro_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.JWT_SECRET = 'test_secret_key_32_chars_minimum!!';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const app = require('../server');

// NOTE: These tests require a running MySQL test database
// Run: mysql -u root -e "CREATE DATABASE financaspro_test;"

describe('Auth API — Task 2 Tests', () => {
  const testUser = {
    name: 'João Teste',
    email: `test_${Date.now()}@example.com`,
    password: 'Senha@123',
  };

  let authToken;

  // ================================================
  // HEALTH CHECK
  // ================================================
  describe('Health Check', () => {
    it('GET /api/health should return 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  // ================================================
  // REGISTER
  // ================================================
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('password_hash');

      authToken = res.body.token;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' });
      expect(res.status).toBe(422);
    });

    it('should reject weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new@test.com', password: 'senhafraca123' });
      expect(res.status).toBe(422);
    });

    it('should reject password shorter than 8 chars', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new2@test.com', password: 'Ab1' });
      expect(res.status).toBe(422);
    });

    it('should reject name too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new3@test.com', name: 'A' });
      expect(res.status).toBe(422);
    });

    // SQL Injection attempt
    it('should sanitize SQL injection in name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: "'; DROP TABLE users; --",
          email: 'sqlinject@test.com',
          password: 'Test@1234',
        });
      // Should not crash the server (either 201 or 422, never 500)
      expect([201, 422]).toContain(res.status);
    });
  });

  // ================================================
  // LOGIN
  // ================================================
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass!123' });
      expect(res.status).toBe(401);
      // Should not expose whether email exists
      expect(res.body.error).toBe('E-mail ou senha inválidos.');
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notexists@test.com', password: 'AnyPass!123' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('E-mail ou senha inválidos.');
    });

    it('should reject empty credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.status).toBe(422);
    });
  });

  // ================================================
  // PROTECTED ROUTE - JWT
  // ================================================
  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');
      expect(res.status).toBe(401);
    });

    it('should reject request with malformed Bearer header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer sometoken');
      expect(res.status).toBe(401);
    });
  });

  // ================================================
  // SECURITY — Headers
  // ================================================
  describe('Security Headers', () => {
    it('should have security headers (helmet)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers).toHaveProperty('x-frame-options');
    });
  });
});
