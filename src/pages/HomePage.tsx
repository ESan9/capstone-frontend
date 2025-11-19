import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../services/api";
import type { Product, Category } from "../types/api";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // 1. Cerchiamo un prodotto "In Evidenza" per la Hero Section
        const highlightedRes = await api.fetchProducts({
          highlighted: true,
          size: 1,
        });
        if (highlightedRes.content.length > 0) {
          setHeroProduct(highlightedRes.content[0]);
        }

        // 2. Fetch Categorie (3 per la griglia)
        const categoriesRes = await api.fetchCategories();
        setCategories(categoriesRes.content.slice(0, 3));

        // 3. Fetch Ultimi Arrivi (Ordino per ID decrescente per avere i più nuovi)
        const latestRes = await api.fetchProducts({
          size: 4,
          sort: "idProduct,desc",
        });
        setLatestProducts(latestRes.content);
      } catch (err) {
        console.error("Errore caricamento home", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <div className="relative bg-gray-900 text-white">
        {/* Immagine di sfondo con overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={
              heroProduct?.productImages?.[0]?.imageUrl ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
            }
            alt="Hero Background"
            className="h-full w-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:py-48 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white drop-shadow-md">
            {heroProduct ? heroProduct.name : "Nuova Collezione"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200 max-w-xl drop-shadow-sm">
            {heroProduct
              ? heroProduct.description.substring(0, 150) +
                (heroProduct.description.length > 150 ? "..." : "")
              : "Scopri i prodotti artigianali selezionati per te. Qualità e stile senza compromessi."}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to={heroProduct ? `/product/${heroProduct.slug}` : "/shop"}
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
            >
              {heroProduct ? "Clicca per il dettaglio" : "Vai al Negozio"}
            </Link>
            {!heroProduct && (
              <Link
                to="/about"
                className="text-sm font-semibold leading-6 text-white hover:text-gray-300"
              >
                Scopri di più <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ================= CATEGORIE SECTION ================= */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8 text-center">
          Esplora le Categorie
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.idCategory}
              className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden bg-gray-200 group-hover:opacity-90 transition-opacity">
                <img
                  src={
                    cat.coverImageUrl ||
                    `https://placehold.co/600x400?text=${cat.name}`
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    <Link to={`/category/${cat.slug}`}>
                      <span className="absolute inset-0" />
                      {cat.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/categories"
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            Vedi tutte le categorie <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* ================= ULTIMI ARRIVI ================= */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Ultimi Arrivi
              </h2>
              <p className="mt-2 text-gray-500">
                I prodotti più recenti aggiunti al catalogo.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:block text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              Vedi tutto il catalogo &rarr;
            </Link>
          </div>

          {/* Qui usiamo il tuo ProductCard */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {latestProducts.map((product) => (
              <ProductCard key={product.idProduct} product={product} />
            ))}
          </div>

          <div className="mt-8 sm:hidden text-center">
            <Link
              to="/shop"
              className="text-sm font-semibold text-gray-900 hover:text-gray-600"
            >
              Vedi tutto il catalogo &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
