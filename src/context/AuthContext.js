import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // true enquanto restaura a sessão salva

  useEffect(() => {
    apiService.setOnUnauthorized(() => setSession(null));

    (async () => {
      const usuario = await apiService.restoreSession();
      if (usuario) {
        setSession({ name: usuario.nome, mode: 'user', usuario });
      }
      setLoading(false);
    })();
  }, []);

  const value = useMemo(() => ({
    session,
    loading,
    isAuthenticated: Boolean(session),

    signIn: async (email, senha) => {
      const response = await apiService.login(email, senha);
      setSession({ name: response.usuario?.nome || email.split('@')[0], mode: 'user', usuario: response.usuario });
      return response;
    },

    signInAsGuest: () => {
      setSession({ name: 'Convidado', mode: 'guest' });
    },

    signOut: async () => {
      await apiService.logout();
      setSession(null);
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
