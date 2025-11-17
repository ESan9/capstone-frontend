import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as api from "../services/api";
import type { User, LoginDTO } from "../types/api";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- DEBUG #2 ---
    // Questo si attiva al caricamento e ogni volta che 'setToken' viene chiamato
    console.log("AuthContext useEffect: Triggerato. Token attuale:", token);

    const loadUserFromToken = async () => {
      if (token) {
        try {
          console.log(
            "AuthContext useEffect: Token trovato, provo a chiamare api.getMe()..."
          );
          // L'interceptor in api.ts attaccherà il 'token' a questa richiesta
          const userData = await api.getMe();
          console.log(
            "AuthContext useEffect: api.getMe() HA SUCCESSO",
            userData
          );
          setUser(userData);
        } catch (error) {
          console.error("AuthContext useEffect: api.getMe() FALLITO.", error);
          setToken(null);
          setUser(null);
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, [token]); // <-- Dipende dal token

  // Funzione di Login
  const login = async (credentials: LoginDTO) => {
    try {
      // 1. API di login
      const response = await api.login(credentials);

      // --- DEBUG #1 ---
      console.log("AuthContext login: Login API ha successo.", response);
      console.log("AuthContext login: Token ricevuto:", response.accessToken);

      // 2. Salvo il token nel localStorage PRIMA
      localStorage.setItem("authToken", response.accessToken);

      // 3. AGGIORNO LO STATO DEL TOKEN.
      console.log(
        "AuthContext login: Chiamo setToken() per triggerare useEffect."
      );
      setToken(response.accessToken);
    } catch (error) {
      console.error("AuthContext login: Fallimento login nel contesto:", error);
      throw error;
    }
  };

  // Funzione di Logout
  const logout = () => {
    console.log("AuthContext logout: Eseguo logout.");
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
