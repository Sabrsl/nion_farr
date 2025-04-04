import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  updateUserProfile: async () => ({ success: false })
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement initial
    const checkUserSession = async () => {
      try {
        // Simuler un appel API pour vérifier la session
        // const response = await fetch('/api/auth/me');
        // if (response.ok) {
        //   const userData = await response.json();
        //   setUser(userData);
        // }
        
        // Pour la démonstration, on utilise un utilisateur fictif
        const storedUser = localStorage.getItem('nionfarUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simuler un appel API d'authentification
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // const data = await response.json();
      // if (response.ok) {
      //   setUser(data.user);
      //   return { success: true };
      // }
      
      // Pour la démonstration, on vérifie juste si l'email contient "test"
      if (email.includes('test')) {
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role: 'freelancer',
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('nionfarUser', JSON.stringify(mockUser));
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'Identifiants invalides. Utilisez un email contenant "test" pour la démo.' 
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de la connexion.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Simuler un appel API de déconnexion
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Pour la démonstration, on supprime simplement l'utilisateur du state
      localStorage.removeItem('nionfarUser');
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      // Simuler un appel API d'inscription
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   body: JSON.stringify(userData),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // const data = await response.json();
      // if (response.ok) {
      //   setUser(data.user);
      //   return { success: true };
      // }
      
      // Pour la démonstration, on crée simplement un nouvel utilisateur
      if (userData.email) {
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          role: userData.role || 'freelancer',
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('nionfarUser', JSON.stringify(mockUser));
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'Veuillez fournir une adresse email valide.' 
      };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de l\'inscription.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) {
        return { 
          success: false, 
          message: 'Vous devez être connecté pour mettre à jour votre profil.' 
        };
      }
      
      // Simuler un appel API de mise à jour de profil
      // const response = await fetch('/api/users/me', {
      //   method: 'PATCH',
      //   body: JSON.stringify(userData),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // const data = await response.json();
      // if (response.ok) {
      //   setUser(data.user);
      //   return { success: true };
      // }
      
      // Pour la démonstration, on met simplement à jour l'utilisateur dans le state
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('nionfarUser', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de la mise à jour du profil.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 