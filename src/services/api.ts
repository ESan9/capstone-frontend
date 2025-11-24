import axios from "axios";
import type {
  Category,
  Page,
  Product,
  ProductFilterParams,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  User,
  NewCategoryDTO,
  NewProductDTO,
  ProductImage,
  BackendErrorResponse,
} from "../types/api";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Creo un "client" axios pre-configurato
const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// Interceptor per il Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Qui intercetto l'errore dal backend

    // 1. Gestione Token Scaduto o Non Valido (401)
    if (error.response && error.response.status === 401) {
      console.warn("Sessione scaduta o non autorizzata. Logout...");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // 2. Gestione Accesso Negato (403)
    if (error.response && error.response.status === 403) {
      alert("Non hai i permessi necessari per eseguire questa azione.");
    }

    // 3. Passiamo l'errore al componente per gestirlo specificamente
    // (es. "Nome prodotto duplicato" nel form)
    return Promise.reject(error);
  }
);
// Funzioni Pubbliche

export const fetchCategories = async (): Promise<Page<Category>> => {
  try {
    const response = await apiClient.get("/category");
    return response.data;
  } catch (error) {
    console.error("Errore nel fetch delle categorie:", error);
    throw error;
  }
};

export const fetchProducts = async (
  params: ProductFilterParams
): Promise<Page<Product>> => {
  try {
    const response = await apiClient.get("/product", { params });
    return response.data;
  } catch (error) {
    console.error("Errore nel fetch dei prodotti:", error);
    throw error;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await apiClient.get(`/product/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel fetch del prodotto ${slug}:`, error);
    throw error;
  }
};

// FUNZIONI DI AUTENTICAZIONE

export const login = async (
  credentials: LoginDTO
): Promise<LoginResponseDTO> => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Errore nel login:", error);
    throw error;
  }
};

export const register = async (userData: RegisterDTO): Promise<User> => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Errore nella registrazione:", error);
    throw error;
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Errore nel fetch del profilo utente:", error);
    throw error;
  }
};

// FUNZIONI ADMIN (Scrittura)

// 1. Crea Categoria
export const createCategory = async (
  data: NewCategoryDTO
): Promise<Category> => {
  const response = await apiClient.post("/category", data);
  return response.data;
};

// 2. Upload Immagine Categoria
export const uploadCategoryCover = async (
  categoryId: string,
  file: File
): Promise<Category> => {
  const formData = new FormData();
  formData.append("cover", file);
  const response = await apiClient.post(
    `/category/${categoryId}/upload-cover`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

// 3. Crea Prodotto
export const createProduct = async (data: NewProductDTO): Promise<Product> => {
  const response = await apiClient.post("/product", data);
  return response.data;
};

// 4. Upload Immagine Prodotto
export const uploadProductImage = async (
  productId: string,
  file: File
): Promise<ProductImage> => {
  const formData = new FormData();
  formData.append("image", file);

  // Axios rileva FormData e imposta automaticamente il Content-Type corretto con il boundary
  const response = await apiClient.post(
    `/product/${productId}/upload-image`,
    formData
  );

  return response.data;
};
// 5. Modifica Categoria
export const updateCategory = async (
  id: string,
  data: NewCategoryDTO
): Promise<Category> => {
  try {
    const response = await apiClient.put(`/category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Errore aggiornamento categoria:", error);
    throw error;
  }
};

// 6. Modifica Prodotto
export const updateProduct = async (
  id: string,
  data: NewProductDTO
): Promise<Product> => {
  try {
    const response = await apiClient.put(`/product/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Errore aggiornamento prodotto:", error);
    throw error;
  }
};

// 7. Elimina Prodotto (Utile per gestire il catalogo)
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/product/${id}`);
  } catch (error) {
    console.error("Errore eliminazione prodotto:", error);
    throw error;
  }
};

// 8. Elimina Categoria
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/category/${id}`);
  } catch (error) {
    console.error("Errore eliminazione categoria:", error);
    throw error;
  }
};

export const getErrorMessage = (error: unknown): string => {
  // Verifica se è un errore di Axios
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as BackendErrorResponse;

    // 1. PRIORITÀ ASSOLUTA: Se il backend manda un messaggio esplicito, uso quello
    if (data && data.message) {
      return data.message;
    }

    // 2. Caso Validation Custom (ErrorsWithListDTO) - se presente
    if (data && data.errorsList && Array.isArray(data.errorsList)) {
      return `${data.message || "Errore validazione"}\n- ${data.errorsList.join(
        "\n- "
      )}`;
    }

    // 3. Fallback specifici basati sullo status (se il backend NON ha mandato un JSON valido)
    if (error.response.status === 413) {
      return "L'immagine è troppo pesante! (Default Frontend)";
    }

    if (error.response.status === 403) {
      return "Non hai i permessi per fare questa azione.";
    }

    // 4. Fallback generico finale
    return data.error || `Errore server: ${error.response.status}`;
  }

  return "Si è verificato un errore imprevisto o di rete.";
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    const response = await apiClient.get(`/category/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel fetch della categoria ${slug}:`, error);
    throw error;
  }
};

export const deleteProductImage = async (imageId: string): Promise<void> => {
  try {
    await apiClient.delete(`/product-images/${imageId}`);
  } catch (error) {
    console.error("Errore eliminazione immagine:", error);
    throw error;
  }
};
