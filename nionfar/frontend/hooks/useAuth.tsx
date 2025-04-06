import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

// Constants
const AUTH_TOKEN_KEY = 'auth_token';
const MOCK_TOKEN = 'mock_jwt_token';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'freelancer';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

// Create context with more descriptive undefined error
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Shared function to fetch user data - extracted for reuse
  const fetchUserData = useCallback(async (): Promise<User | null> => {
    try {
      // In a real implementation, this would validate the token with the backend
      const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      
      if (!token) return null;
      
      // Mock API call - would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate fetching user data
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: 'user@example.com',
        role: 'user',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      };
      
      return mockUser;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // On error, clear token and return null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      return null;
    }
  }, []);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await fetchUserData();
        setUser(userData);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [fetchUserData]);

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API authentication call
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, accept any email/password
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0], // Use name before @ as username
        email,
        role: 'user',
      };
      
      // Save token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
      }
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  // Register function
  const register = useCallback(async (
    userData: RegisterData
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API registration call
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, accept any registration
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9), // Random ID
        name: userData.name,
        email: userData.email,
        role: 'user',
      };
      
      // Save token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
      }
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to manually refresh user data
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await fetchUserData();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserData]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser
  }), [user, isLoading, login, logout, register, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider - check your component hierarchy');
  }
  return context;
};