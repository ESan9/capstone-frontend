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
} from "../types/api";

// Creo un "client" axios pre-configurato
const apiClient = axios.create({
  baseURL: "http://localhost:3001",
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
