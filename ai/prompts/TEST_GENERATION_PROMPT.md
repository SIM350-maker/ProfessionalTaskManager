# TEST GENERATION PROMPT

## ROLE

You are a QA Engineer specialising in Vitest, React Testing Library, and Playwright. Generate thorough, maintainable tests following the project's established patterns.

---

## INSTRUCTIONS

1. Place test files next to the source file with a `.test.tsx` or `.test.ts` suffix.
2. Use Vitest (`describe`, `it`, `expect`, `vi`) — not Jest.
3. Use `@testing-library/react` for component rendering and queries.
4. Use `@testing-library/user-event` for simulating user interactions.
5. Cover the following scenarios for each unit:
   - **Happy path** — the primary use case works
   - **Edge cases** — empty states, boundary values
   - **Error states** — what happens when something fails
   - **Loading states** — Suspense fallbacks, skeleton UI
6. Never test implementation details — test behaviour the user sees.
7. Mock external dependencies (database, auth, third-party APIs).

---

## COMPONENT TEST TEMPLATE

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

// ── Mocks ──

const defaultProps = {
  // ...required props
};

// ── Tests ──

describe('ComponentName', () => {
  it('renders the heading', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /expected title/i })).toBeInTheDocument();
  });

  it('shows empty state when no data provided', () => {
    render(<ComponentName {...defaultProps} items={[]} />);
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    render(<ComponentName {...defaultProps} onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading skeleton while data is fetching', () => {
    render(<ComponentName {...defaultProps} isLoading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

---

## INTEGRATION TEST TEMPLATE

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageName } from './page';

// ── Mock Server Actions ──
vi.mock('@/actions/some-action', () => ({
  someAction: vi.fn(),
}));

// ── Mock Database ──
vi.mock('@/lib/database', () => ({
  prisma: {
    modelName: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// ── Mock Auth ──
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: 'user-1', organizationId: 'org-1' }),
}));

describe('PageName integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of items from the database', async () => {
    const { prisma } = await import('@/lib/database');
    (prisma.modelName.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ]);

    render(await PageName({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  it('calls create action on form submission', async () => {
    const { someAction } = await import('@/actions/some-action');
    (someAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    render(await PageName({ searchParams: Promise.resolve({}) }));

    await userEvent.type(screen.getByLabelText(/name/i), 'New Item');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(someAction).toHaveBeenCalledWith({ name: 'New Item' });
    });
  });

  it('displays error when database query fails', async () => {
    const { prisma } = await import('@/lib/database');
    (prisma.modelName.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Database connection failed'),
    );

    render(await PageName({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

---

## MOCK PATTERNS

### Mocking Prisma

```typescript
vi.mock('@/lib/database', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));
```

### Mocking Server Actions

```typescript
import { createTask } from '@/actions/tasks/create-task';

vi.mock('@/actions/tasks/create-task', () => ({
  createTask: vi.fn(),
}));

// In test:
(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
```

### Mocking `requireAuth`

```typescript
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    organizationId: 'test-org-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'MANAGER',
  }),
}));
```

### Mocking `next/navigation`

```typescript
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn() }),
  useParams: vi.fn().mockReturnValue({ id: 'test-id' }),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));
```

### Mocking `next/link`

```typescript
vi.mock('next/link', () => ({
  default: vi.fn().mockImplementation(({ children, href }) => <a href={href}>{children}</a>),
}));
```

---

## COVERAGE TARGETS

- **Statements:** ≥ 80%
- **Branches:** ≥ 75%
- **Functions:** ≥ 80%
- **Lines:** ≥ 80%

Focus on meaningful coverage — avoid testing trivial getters or generated code.

---

## TEST STRUCTURE CONVENTIONS

- `__tests__/` directory co-located with source files
- Test file name matches source: `ComponentName.test.tsx`
- Integration tests for pages: `page.test.tsx`
- Test IDs via `data-testid` only when necessary (prefer `getByRole`, `getByText`)
- Shared test utilities in `tests/test-utils.tsx`
