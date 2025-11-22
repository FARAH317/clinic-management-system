import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au démarrage
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Erreur parsing user:', err);
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const setUserAndSave = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('adminUser');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndSave, logout }}>
      {children}
    </AuthContext.Provider>
  );
}