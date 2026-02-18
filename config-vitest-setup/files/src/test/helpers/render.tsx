// =============================================================================
// Custom Render Helper
// =============================================================================
// Wraps React Testing Library's render() with application-level providers
// (theme, router, etc.) so every test gets the same context without boilerplate.
//
// Usage:
//   import { render, screen } from '@/test/helpers/render';
//   render(<MyComponent />);
//   expect(screen.getByRole('button')).toBeInTheDocument();
// =============================================================================

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// -----------------------------------------------------------------------------
// Provider wrapper
// -----------------------------------------------------------------------------

/**
 * Options for configuring the test providers.
 * Extend this interface as your app adds more providers (auth, i18n, etc.)
 */
interface ProviderOptions {
  /** Optional children wrapper — useful for injecting a custom router or store */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Creates the default provider tree that wraps every rendered component.
 * Add your ThemeProvider, RouterProvider, QueryClientProvider, etc. here.
 */
function createWrapper(options: ProviderOptions = {}) {
  const { wrapper: CustomWrapper } = options;

  return function AllProviders({ children }: { children: ReactNode }) {
    // Layer 1: Application providers (add yours here)
    let tree = <>{children}</>;

    // Layer 2: Optional custom wrapper from the test
    if (CustomWrapper) {
      tree = <CustomWrapper>{tree}</CustomWrapper>;
    }

    return tree;
  };
}

// -----------------------------------------------------------------------------
// Custom render
// -----------------------------------------------------------------------------

/**
 * Extended render options — includes provider configuration.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providerOptions?: ProviderOptions;
}

/**
 * Custom render that wraps the component in application providers.
 * Returns all standard RTL queries plus a pre-configured `user` for
 * simulating user interactions.
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { providerOptions, ...renderOptions } = options;

  const result = render(ui, {
    wrapper: createWrapper(providerOptions),
    ...renderOptions,
  });

  return {
    ...result,
    // Pre-configured userEvent instance — use result.user.click(), .type(), etc.
    user: userEvent.setup(),
  };
}

// -----------------------------------------------------------------------------
// Re-exports
// -----------------------------------------------------------------------------

// Re-export everything from RTL so tests only need one import
export * from '@testing-library/react';

// Override the default render with our custom one
export { customRender as render };
