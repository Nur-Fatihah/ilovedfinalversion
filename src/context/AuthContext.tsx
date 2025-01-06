import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_STATE: 'isAuthenticated',
  USER: 'user',
};

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (authState: boolean) => void;
  user: { name: string; email: string; uid: string } | null;
  setUser: (user: { name: string; email: string; uid: string } | null) => void;
  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; uid: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedAuthState = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_STATE);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedAuthState) setIsAuthenticated(JSON.parse(storedAuthState));
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to load auth state:', error);
      }
    })();
  }, []);

  const handleSetIsAuthenticated = async (authState: boolean) => {
    try {
      setIsAuthenticated(authState);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
      if (!authState) {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  const handleSetUser = async (user: { name: string; email: string; uid: string } | null) => {
    try {
      setUser(user);
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const signOut = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated: handleSetIsAuthenticated,
        user,
        setUser: handleSetUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
