import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
  userAPI: {
    getProfile: jest.fn(),
  },
}));

const TestComponent = () => {
  const { user, token, isLoading, login, register, logout, refreshUser } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="loading">{isLoading ? 'true' : 'false'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password', 'John', 'Doe')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshUser}>Refresh</button>
    </div>
  );
};

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with null user and token', () => {
    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
  });

  it('should set loading to false after initialization', async () => {
    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should restore user from localStorage on mount', () => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
  });

  it('should logout and clear state', async () => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuthProvider(<TestComponent />);

    // Verify user is logged in
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));

    fireEvent.click(screen.getByText('Logout'));

    // Verify state is cleared
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');

    // Verify localStorage was cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should not call getProfile if no token on refresh', async () => {
    const api = await import('../services/api');

    renderWithAuthProvider(<TestComponent />);

    fireEvent.click(screen.getByText('Refresh'));

    // Should not call getProfile since there's no token
    expect(api.userAPI.getProfile).not.toHaveBeenCalled();
  });
});
