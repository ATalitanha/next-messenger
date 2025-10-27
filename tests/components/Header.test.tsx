import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '@/components/auth/Header';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button"></div>,
  SignInButton: () => <button>Sign In</button>,
  SignUpButton: () => <button>Sign Up</button>,
}));

describe('Header', () => {
  it('renders the header', () => {
    render(<Header />);
    expect(screen.getByText('Secure Messenger')).toBeInTheDocument();
  });

  it('shows sign in and sign up buttons when signed out', () => {
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});
