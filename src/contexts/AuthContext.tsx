import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
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
  isBackendReachable: boolean;
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
  const [isBackendReachable, setIsBackendReachable] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Try cookie-based auth first (via refresh endpoint)
      try {
        const refreshResponse = await authAPI.refresh();
        const responseBody = refreshResponse.data;
        const authData: AuthResponse | undefined = responseBody?.data || responseBody;
        if (authData?.token) {
          setToken(authData.token);
          if (authData.user) {
            setUser(authData.user);
            localStorage.setItem('user', JSON.stringify(authData.user));
          }
          localStorage.setItem('token', authData.token);
          setIsLoading(false);
          setIsBackendReachable(true);
          return;
        }
      } catch {
        // Cookie-based refresh failed, fall back to localStorage
        setIsBackendReachable(false);
      }

      // Fallback: restore session from localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser && storedUser !== 'undefined') {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Try to validate the token by fetching profile
          const profileResponse = await userAPI.getProfile();
          setUser(profileResponse.data);
          setIsBackendReachable(true);
        } catch {
          // Token is invalid or expired, clear stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
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
        // Keep localStorage as fallback during cookie migration
        localStorage.setItem('token', authData.token);
        // Store only user id and email in localStorage (minimal info for session check)
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: authData.user.id,
            email: authData.user.email,
            firstName: authData.user.firstName,
            lastName: authData.user.lastName,
          }),
        );
        setIsBackendReachable(true);
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
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          firstName: authData.user.firstName,
          lastName: authData.user.lastName,
        }),
      );
      setIsBackendReachable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout API errors - still clear local state
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await userAPI.getProfile();
      const userData: User = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsBackendReachable(true);
    } catch {
      // Silently ignore refresh errors
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    isBackendReachable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
