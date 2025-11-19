import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as api from "../services/api";
import type { Product } from "../types/api";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        // Assicurati che fetchProductBySlug esista nel tuo api.ts
        const data = await api.fetchProductBySlug(slug);
        setProduct(data);
      } catch {
        setError("Prodotto non trovato.");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) return <div className="py-20 text-center">Caricamento...</div>;
  if (error || !product)
    return (
      <div className="py-20 text-center text-red-600">
        {error || "Prodotto inesistente"}
      </div>
    );

  const mainImage =
    product.productImages?.[0]?.imageUrl ||
    "https://placehold.co/600x600?text=No+Image";

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* --- COLONNA SINISTRA: IMMAGINE --- */}
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg border border-gray-200">
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* --- COLONNA DESTRA: INFO --- */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                € {product.price.toFixed(2)}
              </p>
            </div>

            {/* Disponibilità */}
            <div className="mt-6 flex items-center">
              {product.availability === "AVAILABLE" ? (
                <>
                  <CheckIcon
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                  <p className="ml-2 text-sm text-gray-500">
                    Disponibile subito
                  </p>
                </>
              ) : (
                <>
                  <XMarkIcon
                    className="h-5 w-5 flex-shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  <p className="ml-2 text-sm text-gray-500">Non disponibile</p>
                </>
              )}
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Dettagli Tecnici */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-sm font-medium text-gray-900">Dettagli</h3>
              <div className="mt-4 prose prose-sm text-gray-500">
                <ul role="list">
                  {product.materials && (
                    <li>
                      <span className="font-semibold text-gray-900">
                        Materiali:
                      </span>{" "}
                      {product.materials}
                    </li>
                  )}
                  {product.dimension && (
                    <li>
                      <span className="font-semibold text-gray-900">
                        Dimensioni:
                      </span>{" "}
                      {product.dimension}
                    </li>
                  )}
                  <li>
                    <span className="font-semibold text-gray-900">
                      Categoria:
                    </span>{" "}
                    {product.category?.name}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
