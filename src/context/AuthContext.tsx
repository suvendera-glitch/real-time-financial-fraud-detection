import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAsDemoUser: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => void;
  updateBalance: (delta: number) => void;
}

const DEMO_USER: UserProfile = {
  id: 'usr-10482',
  name: 'John Doe',
  email: 'john.doe@enterprise.io',
  role: 'user',
  account_id: 'ACC-2026-10482',
  balance: 284500,
  currency: 'INR',
  device_id: 'DEV-MAC-881',
  trusted_locations: ['Bengaluru, India', 'Mumbai, India'],
};

const DEMO_ADMIN: UserProfile = {
  id: 'adm-00921',
  name: 'Sarah Connor',
  email: 's.connor@cyber.jarvis.io',
  role: 'admin',
  account_id: 'ACC-ADMIN-JARVIS',
  balance: 1500000,
  currency: 'INR',
  device_id: 'DEV-SOC-CONSOLE-4',
  trusted_locations: ['Global SOC, Bengaluru', 'Singapore SOC'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('jarvis_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER; // Default authenticated as Demo User for instant access
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('jarvis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jarvis_auth_user');
    }
  }, [user]);

  const loginAsDemoUser = () => {
    setUser(DEMO_USER);
  };

  const loginAsDemoAdmin = () => {
    setUser(DEMO_ADMIN);
  };

  const logout = () => {
    setUser(null);
  };

  const updateBalance = (delta: number) => {
    if (user) {
      setUser({
        ...user,
        balance: Math.max(0, user.balance + delta),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loginAsDemoUser,
        loginAsDemoAdmin,
        logout,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
