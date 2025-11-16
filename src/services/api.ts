import axios from "axios";
import type {
  Category,
  Page,
  Product,
  ProductFilterParams,
} from "../types/api";

const apiClient = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
});

/**
 * Funzione per caricare le categorie (per la Navbar).
 * Chiama l'endpoint GET /category
 */
export const fetchCategories = async (): Promise<Page<Category>> => {
  try {
    const response = await apiClient.get("/category");
    return response.data;
  } catch (error) {
    console.error("Errore nel fetch delle categorie:", error);
    throw error;
  }
};

/**
 * Funzione per caricare i prodotti (per la vetrina).
 * Chiama l'endpoint GET /product e gli passa i filtri.
 */
export const fetchProducts = async (
  params: ProductFilterParams
): Promise<Page<Product>> => {
  try {
    // Axios converte l'oggetto 'params' in una query string (es. ?page=0&name=borsa)
    const response = await apiClient.get("/product", { params });
    return response.data;
  } catch (error) {
    console.error("Errore nel fetch dei prodotti:", error);
    throw error;
  }
};

/**
 * Funzione per caricare un singolo prodotto (per la pagina di dettaglio).
 * Chiama l'endpoint GET /product/{slug}
 */
export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await apiClient.get(`/product/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel fetch del prodotto ${slug}:`, error);
    throw error;
  }
};
