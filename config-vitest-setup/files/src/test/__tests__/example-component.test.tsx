// =============================================================================
// Example: React Component Tests
// =============================================================================
// Demonstrates React Testing Library patterns with Vitest:
//   - Custom render helper with providers
//   - userEvent for simulating interactions
//   - screen queries using accessible roles (not test IDs)
//   - waitFor for async assertions
//   - Testing loading / error / success states
//
// This file tests a simple Button component defined inline. In a real project,
// you would import your component from the source code.
// =============================================================================

import React, { useState, useCallback } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../helpers/render';

// -----------------------------------------------------------------------------
// Component under test (inline for demonstration)
// -----------------------------------------------------------------------------

interface ButtonProps {
  /** Button label text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void | Promise<void>;
  /** Disabled state */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * A simple Button component with async click handling and loading state.
 * In a real app this would live in src/components/Button.tsx.
 */
function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (!onClick || disabled || isLoading) return;

    const result = onClick();

    // If the handler returns a promise, show loading state
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result;
      } finally {
        setIsLoading(false);
      }
    }
  }, [onClick, disabled, isLoading]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      data-variant={variant}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('Button', () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it('should render with the correct text', () => {
    render(<Button>Click me</Button>);

    // Prefer getByRole over getByTestId — it mirrors how users find elements
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('should apply the variant as a data attribute', () => {
    render(<Button variant="danger">Delete</Button>);

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('data-variant', 'danger');
  });

  it('should default to the primary variant', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  // ---------------------------------------------------------------------------
  // Click handling
  // ---------------------------------------------------------------------------

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const { user } = render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Loading state (async onClick)
  // ---------------------------------------------------------------------------

  it('should show loading state during async onClick', async () => {
    // Create a promise we control from the test
    let resolveClick!: () => void;
    const clickPromise = new Promise<void>((resolve) => {
      resolveClick = resolve;
    });
    const handleClick = vi.fn(() => clickPromise);

    const { user } = render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });

    // Click the button — triggers the async handler
    await user.click(button);

    // Button should now show loading text and be disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });

    const loadingButton = screen.getByRole('button', { name: 'Loading...' });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    // Resolve the promise — loading state should clear
    resolveClick();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    const resolvedButton = screen.getByRole('button', { name: 'Submit' });
    expect(resolvedButton).not.toBeDisabled();
    expect(resolvedButton).toHaveAttribute('aria-busy', 'false');
  });

  it('should recover from async onClick errors', async () => {
    const handleClick = vi.fn(() => Promise.reject(new Error('Network error')));

    const { user } = render(<Button onClick={handleClick}>Retry</Button>);

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    // After error, button should return to normal state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).not.toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  it('should be focusable and activatable via keyboard', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Focus me</Button>);

    // Tab to the button
    await user.tab();
    expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();

    // Activate via Enter key
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
