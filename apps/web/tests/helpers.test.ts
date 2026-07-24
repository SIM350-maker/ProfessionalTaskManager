import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateTime, isOverdue, getInitials, maskEmail, generateSlug, truncate } from '@/lib/helpers';

describe('Helper Functions', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });
  });

  describe('formatDate', () => {
    it('should format a date', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('10');
      expect(formatted).toContain('30');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      expect(isOverdue(new Date('2020-01-01'))).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isOverdue(future)).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should return initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
    });

    it('should handle single character names', () => {
      expect(getInitials('A', 'B')).toBe('AB');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john', 'doe')).toBe('JD');
    });
  });

  describe('maskEmail', () => {
    it('should mask part of email', () => {
      const masked = maskEmail('john.doe@example.com');
      expect(masked).toContain('@example.com');
      expect(masked).not.toContain('john.doe');
      expect(masked).toContain('***');
    });
  });

  describe('generateSlug', () => {
    it('should generate a slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello & World!')).toBe('hello-world');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World This Is Long', 10)).toBe('Hello Worl...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });
});
