// src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';

// Define el tipo para el contexto
interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
}

// Crea el contexto con valores por defecto
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  login: () => {},
  logout: () => {},
});

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Verifica si hay un userId almacenado en localStorage al cargar
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
    }
  }, []);

  const login = (id: string) => {
    setIsAuthenticated(true);
    setUserId(id);
    localStorage.setItem('userId', id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
