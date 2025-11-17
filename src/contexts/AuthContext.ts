import { createContext } from "react";
import type { User, LoginDTO } from "../types/api";

// Definiamo la "forma" del nostro contesto
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
}

// Creiamo ed esportiamo il Contesto
// @ts-expect-error Inizializziamo con 'undefined' (gestito dall'hook useAuth)
export const AuthContext = createContext<AuthContextType>(undefined);
