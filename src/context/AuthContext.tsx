"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  phone: string;
  uid: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthLoaded: boolean;
  login: (userData: { name: string; phone: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    const name = localStorage.getItem('userName');
    if (phone) {
      // Mocking UID based on phone for the prototype database relations
      setUser({ name: name || '', phone, uid: `user_${phone}`, email: `${phone}@example.com` });
    }
    setIsAuthLoaded(true);
  }, []);

  const login = (userData: { name: string; phone: string }) => {
    localStorage.setItem('userPhone', userData.phone);
    if (userData.name) localStorage.setItem('userName', userData.name);
    setUser({ ...userData, uid: `user_${userData.phone}`, email: `${userData.phone}@example.com` });
  };

  const logout = () => {
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
