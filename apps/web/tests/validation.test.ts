import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createTaskSchema,
  createProjectSchema,
  createCommentSchema,
  createTeamSchema,
  changePasswordSchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Corp',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Corp',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Corp',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate a valid login', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({ password: 'password' });
      expect(result.success).toBe(false);
    });
  });

  describe('createTaskSchema', () => {
    it('should validate a valid task', () => {
      const result = createTaskSchema.safeParse({
        title: 'Test Task',
        projectId: 'some-project-id',
        status: 'TODO',
        priority: 'MEDIUM',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing title', () => {
      const result = createTaskSchema.safeParse({
        projectId: 'some-project-id',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectSchema', () => {
    it('should validate a valid project', () => {
      const result = createProjectSchema.safeParse({
        name: 'Test Project',
        description: 'A description',
        status: 'ACTIVE',
        visibility: 'PRIVATE',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = createProjectSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('createCommentSchema', () => {
    it('should validate a valid comment', () => {
      const result = createCommentSchema.safeParse({
        message: 'A comment',
        taskId: 'some-task-id',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const result = createCommentSchema.safeParse({
        message: '',
        taskId: 'some-task-id',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createTeamSchema', () => {
    it('should validate a valid team', () => {
      const result = createTeamSchema.safeParse({
        name: 'Engineering',
        description: 'Engineering team',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'old123',
        newPassword: 'NewPass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing current password', () => {
      const result = changePasswordSchema.safeParse({
        newPassword: 'NewPass123',
      });
      expect(result.success).toBe(false);
    });
  });
});
