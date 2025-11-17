import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Questo è il nostro Hook personalizzato.
 * Lo teniamo in un file separato per non violare
 * la regola "only-export-components" di Vite Fast Refresh.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
};
