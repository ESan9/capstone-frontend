import { useState, useEffect } from "react";
import type { Product, ProductFilterParams } from "../types/api";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtri di base
  const [filters] = useState<ProductFilterParams>({
    page: 0,
    size: 9, // 9 prodotti (3x3)
    sort: "name,asc",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProducts(filters);
        setProducts(response.content);
      } catch (err) {
        setError("Impossibile caricare i prodotti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  // Gestione stati (Caricamento, Errore, Vuoto)
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Caricamento dei prodotti...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Errore: {error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nessun prodotto trovato. (Assicurati di aver creato dei prodotti nel
        backend!)
      </div>
    );
  }

  // Render della Griglia
  return (
    <div className="bg-white p-6 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        I Nostri Prodotti
      </h1>

      {/* Griglia responsive di Tailwind */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.idProduct} product={product} />
        ))}
      </div>
    </div>
  );
}
