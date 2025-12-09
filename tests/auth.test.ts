import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { connectDB } from '@/lib/db';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          walletAddress: 'addr_test1...',
        },
      });

      const response = await registerHandler(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should fail with duplicate email', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Another User',
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const response = await registerHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('existe déjà');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const response = await loginHandler(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should fail with invalid credentials', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      const response = await loginHandler(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('incorrect');
    });
  });
});