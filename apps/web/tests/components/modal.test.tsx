import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/modal';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('Modal', () => {
  it('renders when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking overlay', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );
    const overlay = screen.getByRole('dialog').firstElementChild;
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await user.click(overlay!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders title', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Title">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Child content</p>
      </Modal>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders footer actions via children', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Confirm">
        <div>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      </Modal>,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    const buttons = screen.getAllByText('Confirm');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});