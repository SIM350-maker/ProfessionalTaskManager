import { describe, it, expect } from 'vitest';
import { APP_NAME, PAGINATION, STATUS_LABELS, PRIORITY_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants';

describe('Constants', () => {
  it('should have an app name', () => {
    expect(APP_NAME).toBeTruthy();
    expect(typeof APP_NAME).toBe('string');
  });

  it('should have pagination defaults', () => {
    expect(PAGINATION.DEFAULT_LIMIT).toBeGreaterThan(0);
    expect(PAGINATION.MAX_LIMIT).toBeGreaterThanOrEqual(PAGINATION.DEFAULT_LIMIT);
  });

  it('should have status labels for all statuses', () => {
    const expected = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'];
    for (const status of expected) {
      expect(STATUS_LABELS[status as keyof typeof STATUS_LABELS]).toBeTruthy();
    }
  });

  it('should have priority labels for all priorities', () => {
    const expected = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    for (const priority of expected) {
      expect(PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]).toBeTruthy();
    }
  });

  it('should have project status labels', () => {
    const expected = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
    for (const status of expected) {
      expect(PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS]).toBeTruthy();
    }
  });
});
