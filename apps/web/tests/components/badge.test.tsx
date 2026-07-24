import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/badge';

afterEach(() => {
  cleanup();
});

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default').className).toContain('bg-[var(--color-bg-hover)]');
  });

  it('applies success variant class', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').className).toContain('bg-[var(--color-accent-green-light)]');
  });

  it('applies warning variant class', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning').className).toContain('bg-[var(--color-accent-amber-light)]');
  });

  it('applies error variant class', () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('bg-[var(--color-accent-red-light)]');
  });

  it('applies info variant class', () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info').className).toContain('bg-[var(--color-accent-blue-light)]');
  });
});

describe('StatusBadge', () => {
  it('shows correct label for TODO', () => {
    render(<StatusBadge status="TODO" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('shows correct label for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows correct label for IN_REVIEW', () => {
    render(<StatusBadge status="IN_REVIEW" />);
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });

  it('shows correct label for DONE', () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows correct label for ARCHIVED', () => {
    render(<StatusBadge status="ARCHIVED" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('applies correct color class for TODO', () => {
    render(<StatusBadge status="TODO" />);
    expect(screen.getByText('To Do').className).toContain('bg-[var(--color-bg-hover)]');
  });

  it('applies correct color class for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress').className).toContain('bg-[var(--color-accent-blue-light)]');
  });

  it('applies correct color class for DONE', () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText('Done').className).toContain('bg-[var(--color-accent-green-light)]');
  });
});

describe('PriorityBadge', () => {
  it('shows correct label for LOW', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('shows correct label for MEDIUM', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('shows correct label for HIGH', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows correct label for URGENT', () => {
    render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  it('applies correct color class for LOW', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW').className).toContain('bg-[var(--color-bg-hover)]');
  });

  it('applies correct color class for MEDIUM', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM').className).toContain('bg-[var(--color-accent-blue-light)]');
  });

  it('applies correct color class for HIGH', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH').className).toContain('bg-[var(--color-accent-amber-light)]');
  });

  it('applies correct color class for URGENT', () => {
    render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('URGENT').className).toContain('bg-[var(--color-accent-red-light)]');
  });
});