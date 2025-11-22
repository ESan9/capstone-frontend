import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Product, ProductFilterParams, Category } from "../types/api";
import {
  fetchProducts,
  fetchCategories,
  fetchCategoryBySlug,
} from "../services/api";
import ProductCard from "../components/ProductCard";
import {
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

export default function ProductList() {
  const { slug } = useParams<{ slug: string }>();

  // STATI DATI
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0); // <--- NUOVO: Stato per pagine totali
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STATO VISIBILITÀ FILTRI MOBILE
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // STATI FILTRI
  const [activeFilters, setActiveFilters] = useState<ProductFilterParams>({
    page: 0,
    size: 9,
    sort: "name,asc",
  });

  // Filtri temporanei (form)
  const [tempFilters, setTempFilters] = useState<ProductFilterParams>({
    page: 0,
    size: 9,
    sort: "name,asc",
    name: "",
    minPrice: undefined,
    maxPrice: undefined,
    categoryId: "",
  });

  // 1. Carica Categorie all'avvio
  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.content));
  }, []);

  // 2. Inizializza filtri se c'è uno slug nell'URL
  useEffect(() => {
    const initFilters = async () => {
      if (slug) {
        try {
          const cat = await fetchCategoryBySlug(slug);
          const newFilters = { ...activeFilters, categoryId: cat.idCategory };
          setActiveFilters(newFilters);
          setTempFilters((prev) => ({ ...prev, categoryId: cat.idCategory }));
        } catch {
          console.error("Categoria non trovata");
        }
      } else {
        setActiveFilters((prev) => ({ ...prev, categoryId: "" }));
        setTempFilters((prev) => ({ ...prev, categoryId: "" }));
      }
    };
    initFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 3. Carica Prodotti quando cambiano i filtri attivi
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pulizia filtri vuoti
        const cleanFilters = Object.fromEntries(
          Object.entries(activeFilters).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null
          )
        );

        const response = await fetchProducts(cleanFilters);

        setProducts(response.content);
        setTotalPages(response.totalPages); // Salviamo il numero totale di pagine
      } catch (err) {
        setError("Impossibile caricare i prodotti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeFilters]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setActiveFilters({
      ...tempFilters,
      page: 0, // Quando filtro, riparto sempre da pagina 0
    });
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    const resetState: ProductFilterParams = {
      page: 0,
      size: 9,
      sort: "name,asc",
      name: "",
      minPrice: undefined,
      maxPrice: undefined,
      categoryId: "",
    };
    setTempFilters(resetState);
    setActiveFilters(resetState);
    setMobileFiltersOpen(false);
  };

  // Gestione cambio pagina
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setActiveFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
      // Scroll fluido verso l'alto quando si cambia pagina
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER PAGINA */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-200 pb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Catalogo
          </h1>

          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* BOTTONE FILTRI MOBILE (< lg) */}
            <button
              type="button"
              className="flex items-center gap-2 text-gray-700 font-medium lg:hidden"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FunnelIcon className="h-5 w-5" />
              {mobileFiltersOpen ? "Nascondi Filtri" : "Mostra Filtri"}
              {mobileFiltersOpen ? (
                <MinusIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
            </button>

            {/* ORDINAMENTO */}
            <div className="flex items-center ml-auto sm:ml-4">
              <label
                htmlFor="sort"
                className="mr-2 text-sm text-gray-700 hidden sm:block"
              >
                Ordina:
              </label>
              <select
                name="sort"
                value={tempFilters.sort}
                onChange={(e) => {
                  handleInputChange(e);
                  setActiveFilters((prev) => ({
                    ...prev,
                    sort: e.target.value,
                    page: 0, // Reset pagina se cambio ordinamento
                  }));
                }}
                className="border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer bg-transparent"
              >
                <option value="name,asc">Nome (A-Z)</option>
                <option value="name,desc">Nome (Z-A)</option>
                <option value="price,asc">Prezzo (Crescente)</option>
                <option value="price,desc">Prezzo (Decrescente)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
          {/* --- SIDEBAR FILTRI --- */}
          <form
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } lg:block lg:col-span-1 space-y-6 bg-gray-50 p-4 rounded-lg lg:bg-white lg:p-0`}
          >
            {/* Ricerca Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cerca
              </label>
              <input
                type="text"
                name="name"
                value={tempFilters.name || ""}
                onChange={handleInputChange}
                placeholder="Nome prodotto..."
                className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Categoria
              </label>
              <select
                name="categoryId"
                value={tempFilters.categoryId || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 cursor-pointer"
              >
                <option value="">Tutte le categorie</option>
                {categories.map((cat) => (
                  <option key={cat.idCategory} value={cat.idCategory}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prezzo */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Prezzo (€)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={tempFilters.minPrice || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={tempFilters.maxPrice || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Pulsanti Azione */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none cursor-pointer"
              >
                <FunnelIcon className="mr-2 h-4 w-4" />
                Applica Filtri
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                <XMarkIcon className="mr-2 h-4 w-4" />
                Reset
              </button>
            </div>
          </form>

          {/* --- GRIGLIA PRODOTTI & PAGINAZIONE --- */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-10">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 py-20 border-2 border-dashed border-gray-200 rounded-lg">
                Nessun prodotto corrisponde ai filtri selezionati.
              </div>
            ) : (
              <>
                {/* Griglia */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.idProduct} product={product} />
                  ))}
                </div>

                {/* PAGINAZIONE */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center border-t border-gray-200 pt-8">
                    <div className="flex items-center gap-2">
                      {/* Bottone Precedente */}
                      <button
                        onClick={() =>
                          handlePageChange((activeFilters.page ?? 0) - 1)
                        }
                        disabled={(activeFilters.page ?? 0) === 0}
                        className={`flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${
                          (activeFilters.page ?? 0) === 0
                            ? "cursor-not-allowed bg-gray-50 text-gray-400 ring-gray-200"
                            : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <ChevronLeftIcon className="mr-1 h-4 w-4" />
                        Indietro
                      </button>

                      {/* Indicatore Pagine */}
                      <span className="px-4 text-sm font-medium text-gray-700">
                        {/* Aggiunto ( ?? 0) */}
                        Pagina {(activeFilters.page ?? 0) + 1} di {totalPages}
                      </span>

                      {/* Bottone Successivo */}
                      <button
                        // Aggiunto ( ?? 0)
                        onClick={() =>
                          handlePageChange((activeFilters.page ?? 0) + 1)
                        }
                        disabled={(activeFilters.page ?? 0) >= totalPages - 1}
                        className={`flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${
                          (activeFilters.page ?? 0) >= totalPages - 1
                            ? "cursor-not-allowed bg-gray-50 text-gray-400 ring-gray-200"
                            : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Avanti
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
