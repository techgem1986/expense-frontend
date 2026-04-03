import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authAPI, userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser && storedUser !== 'undefined') {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      // Handle both { data: { token, user } } and { token, user }
      let authData: AuthResponse | undefined;
      if (response.data && response.data.token && response.data.user) {
        authData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.token &&
        response.data.data.user
      ) {
        authData = response.data.data;
      }

      if (authData) {
        setToken(authData.token);
        setUser(authData.user);
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
      } else {
        throw new Error('Login response did not contain token/user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({ email, password, firstName, lastName });
      const authData: AuthResponse = response.data;

      setToken(authData.token);
      setUser(authData.user);

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await userAPI.getProfile();
      const userData: User = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // Silently ignore refresh errors
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
