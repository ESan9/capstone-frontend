import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // <--- Importa useParams
import type { Product, ProductFilterParams, Category } from "../types/api";
import { fetchProducts, fetchCategoryBySlug } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const { slug } = useParams<{ slug: string }>(); // Legge lo slug dall'URL

  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Filtri di base
        let currentFilters: ProductFilterParams = {
          page: 0,
          size: 12,
          sort: "name,asc",
        };

        // SE C'È UNO SLUG (Siamo in /category/borse)
        if (slug) {
          // 1. Recuperiamo l'ID della categoria dallo slug
          const categoryData = await fetchCategoryBySlug(slug);
          setCurrentCategory(categoryData);

          // 2. Aggiungiamo l'ID ai filtri
          currentFilters = {
            ...currentFilters,
            categoryId: categoryData.idCategory,
          };
        } else {
          // Se non c'è slug, resettiamo la categoria corrente
          setCurrentCategory(null);
        }

        // 3. Scarichiamo i prodotti (filtrati o tutti)
        const response = await fetchProducts(currentFilters);
        setProducts(response.content);
      } catch (err) {
        console.error(err);
        setError(
          "Impossibile caricare i prodotti. La categoria potrebbe non esistere."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]); // Riesegue quando cambia lo slug nell'URL

  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Titolo Dinamico */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {currentCategory ? currentCategory.name : "Tutti i Prodotti"}
        </h1>
        {currentCategory && (
          <p className="mt-2 text-gray-500">{currentCategory.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          Nessun prodotto trovato in questa sezione.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.idProduct} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
