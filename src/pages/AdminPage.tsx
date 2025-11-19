import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import type {
  Category,
  Product,
  NewCategoryDTO,
  NewProductDTO,
} from "../types/api";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"category" | "product">(
    "category"
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // --- STATI DATI & PAGINAZIONE ---
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Paginazione Prodotti
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [prodPage, setProdPage] = useState(0);
  const [prodTotalPages, setProdTotalPages] = useState(0);
  const [prodTotalElements, setProdTotalElements] = useState(0);
  const PAGE_SIZE = 8; // Numero prodotti per pagina

  // --- STATI MODIFICA (ID) ---
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  // --- FORM CATEGORIA ---
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catFile, setCatFile] = useState<File | null>(null);

  // --- FORM PRODOTTO ---
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [prodAvailability, setProdAvailability] = useState<
    "AVAILABLE" | "UNAVAILABLE"
  >("AVAILABLE");
  const [prodHighlighted, setProdHighlighted] = useState(false);
  const [prodMaterials, setProdMaterials] = useState("");
  const [prodDimension, setProdDimension] = useState("");

  // 1. Controllo Accesso
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else {
        const isAdmin = user.roles.some((r) => r.role === "ADMIN");
        if (!isAdmin) {
          alert("Accesso negato: Area riservata agli amministratori.");
          navigate("/");
        }
      }
    }
  }, [user, isLoading, navigate]);

  // 2. Fetch Data Functions
  const refreshCategories = useCallback(() => {
    api
      .fetchCategories()
      .then((res) => setCategoriesList(res.content))
      .catch((err) => console.error("Errore fetch categorie", err));
  }, []);

  const refreshProducts = useCallback(() => {
    api
      .fetchProducts({
        page: prodPage,
        size: PAGE_SIZE,
        sort: "idProduct,desc",
      })
      .then((res) => {
        setProductsList(res.content);
        setProdTotalPages(res.totalPages);
        setProdTotalElements(res.totalElements);
      })
      .catch((err) => console.error("Errore fetch prodotti", err));
  }, [prodPage]);

  // Caricamento Iniziale
  useEffect(() => {
    if (user) {
      if (activeTab === "category") refreshCategories();
      if (activeTab === "product") refreshProducts();
    }
  }, [user, activeTab, refreshCategories, refreshProducts]);

  // --- RESET FORM ---
  const resetCatForm = () => {
    setCatName("");
    setCatDesc("");
    setCatFile(null);
    setEditingCatId(null);
  };

  const resetProdForm = () => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdCategory("");
    setProdFile(null);
    setProdAvailability("AVAILABLE");
    setProdHighlighted(false);
    setProdMaterials("");
    setProdDimension("");
    setEditingProdId(null);
  };

  // ==========================================
  // LOGICA CATEGORIE
  // ==========================================

  const startEditCategory = (cat: Category) => {
    setCatName(cat.name);
    setCatDesc(cat.description);
    setEditingCatId(cat.idCategory);
    window.scrollTo(0, 0);
    setMessage(null);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const catDTO: NewCategoryDTO = {
        name: catName,
        description: catDesc,
        coverImageUrl: "", // Gestito separatamente o dal backend se vuoto
      };

      let categoryId = editingCatId;

      if (editingCatId) {
        // UPDATE
        await api.updateCategory(editingCatId, catDTO);
        setMessage({ type: "success", text: "Categoria aggiornata!" });
      } else {
        // CREATE
        const newCat = await api.createCategory(catDTO);
        categoryId = newCat.idCategory;
        setMessage({ type: "success", text: "Categoria creata!" });
      }

      if (catFile && categoryId) {
        await api.uploadCategoryCover(categoryId, catFile);
      }

      resetCatForm();
      refreshCategories();
    } catch (err) {
      console.error(err);
      const errorText = api.getErrorMessage(err);
      setMessage({ type: "error", text: errorText });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !window.confirm(
        "Sei sicuro? Se la categoria ha prodotti, l'operazione fallirà."
      )
    )
      return;
    try {
      await api.deleteCategory(id);
      setMessage({ type: "success", text: "Categoria eliminata." });
      refreshCategories();
    } catch (err) {
      const errorText = api.getErrorMessage(err);

      if (
        errorText.includes("integrity") ||
        errorText.includes("ConstraintViolation")
      ) {
        setMessage({
          type: "error",
          text: "Impossibile eliminare: l'elemento è usato in altri ordini o prodotti.",
        });
      } else {
        setMessage({ type: "error", text: errorText });
      }
    }
  };

  // ==========================================
  // LOGICA PRODOTTI
  // ==========================================

  const startEditProduct = (prod: Product) => {
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price.toString());
    setProdCategory(prod.category?.idCategory || "");
    setProdAvailability(prod.availability);
    setProdHighlighted(prod.highlighted);
    setProdMaterials(prod.materials || "");
    setProdDimension(prod.dimension || "");
    setEditingProdId(prod.idProduct);
    window.scrollTo(0, 0);
    setMessage(null);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const prodDTO: NewProductDTO = {
        name: prodName,
        description: prodDesc,
        price: parseFloat(prodPrice),
        availability: prodAvailability,
        highlighted: prodHighlighted,
        materials: prodMaterials,
        dimension: prodDimension,
        categoryId: prodCategory,
      };

      let productId = editingProdId;

      if (editingProdId) {
        // UPDATE
        await api.updateProduct(editingProdId, prodDTO);
        setMessage({ type: "success", text: "Prodotto aggiornato!" });
      } else {
        // CREATE
        const newProd = await api.createProduct(prodDTO);
        productId = newProd.idProduct;
        setMessage({ type: "success", text: "Prodotto creato!" });
      }

      if (prodFile && productId) {
        await api.uploadProductImage(productId, prodFile);
      }

      resetProdForm();
      refreshProducts(); // Ricarica la pagina corrente
    } catch (err) {
      console.error(err);
      const errorText = api.getErrorMessage(err);
      setMessage({ type: "error", text: errorText });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Eliminare definitivamente questo prodotto?")) return;
    try {
      await api.deleteProduct(id);
      setMessage({ type: "success", text: "Prodotto eliminato." });
      refreshProducts();
    } catch (err) {
      const errorText = api.getErrorMessage(err);

      if (
        errorText.includes("integrity") ||
        errorText.includes("ConstraintViolation")
      ) {
        setMessage({
          type: "error",
          text: "Impossibile eliminare: l'elemento è usato in altri ordini o prodotti.",
        });
      } else {
        setMessage({ type: "error", text: errorText });
      }
    }
  };

  // Gestione Paginazione UI
  const handlePrevPage = () => {
    if (prodPage > 0) setProdPage(prodPage - 1);
  };

  const handleNextPage = () => {
    if (prodPage < prodTotalPages - 1) setProdPage(prodPage + 1);
  };

  if (isLoading || !user)
    return <div className="p-10 text-center">Caricamento dashboard...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Admin
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Benvenuto,{" "}
            <span className="font-semibold">
              {user.name} {user.surname}
            </span>
            .
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 md:mt-0 text-sm font-medium text-black hover:underline flex items-center cursor-pointer"
        >
          &larr; Torna al negozio
        </button>
      </div>

      {/* Tabs di Navigazione */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("category");
              resetCatForm();
              setMessage(null);
            }}
            className={`${
              activeTab === "category"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors`}
          >
            Gestione Categorie
          </button>
          <button
            onClick={() => {
              setActiveTab("product");
              resetProdForm();
              setMessage(null);
            }}
            className={`${
              activeTab === "product"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors`}
          >
            Gestione Prodotti
          </button>
        </nav>
      </div>

      {/* Messaggi Feedback */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-md border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ================= SEZIONE CATEGORIA ================= */}
      {activeTab === "category" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Categoria */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmitCategory}
              className="space-y-5 bg-white p-6 shadow sm:rounded-lg border border-gray-200 sticky top-6"
            >
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                {editingCatId ? "Modifica Categoria" : "Nuova Categoria"}
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrizione
                </label>
                <textarea
                  required
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nuova Copertina (Opzionale)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCatFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 justify-center rounded-md bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
                >
                  {editingCatId ? "Aggiorna" : "Crea"}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCatForm}
                    className="flex-1 justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabella Categorie */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categoriesList.map((cat) => (
                    <tr
                      key={cat.idCategory}
                      className={
                        editingCatId === cat.idCategory ? "bg-gray-50" : ""
                      }
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {cat.slug}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => startEditCategory(cat)}
                          className="text-black hover:underline mr-4 font-medium cursor-pointer"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.idCategory)}
                          className="text-red-600 hover:text-red-900 font-medium cursor-pointer"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categoriesList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        Nessuna categoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SEZIONE PRODOTTO ================= */}
      {activeTab === "product" && (
        <div className="flex flex-col gap-8">
          {/* Form Prodotto */}
          <form
            onSubmit={handleSubmitProduct}
            className="bg-white p-6 shadow sm:rounded-lg border border-gray-200"
          >
            <h2 className="text-lg font-medium text-gray-900 border-b pb-4 mb-4">
              {editingProdId ? "Modifica Prodotto" : "Aggiungi Nuovo Prodotto"}
            </h2>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nome Prodotto
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  required
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2 bg-white"
                >
                  <option value="">Seleziona...</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.idCategory} value={cat.idCategory}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Disponibilità
                </label>
                <select
                  required
                  value={prodAvailability}
                  onChange={(e) =>
                    setProdAvailability(
                      e.target.value as "AVAILABLE" | "UNAVAILABLE"
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2 bg-white"
                >
                  <option value="AVAILABLE">Disponibile</option>
                  <option value="UNAVAILABLE">Non Disponibile</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Materiali
                </label>
                <input
                  type="text"
                  value={prodMaterials}
                  required
                  onChange={(e) => setProdMaterials(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Dimensioni
                </label>
                <input
                  type="text"
                  value={prodDimension}
                  required
                  onChange={(e) => setProdDimension(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div className="sm:col-span-6 flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                <input
                  id="highlighted"
                  type="checkbox"
                  checked={prodHighlighted}
                  onChange={(e) => setProdHighlighted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label
                  htmlFor="highlighted"
                  className="text-sm text-gray-700 font-medium cursor-pointer"
                >
                  Metti in evidenza (Homepage Hero)
                </label>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Descrizione
                </label>
                <textarea
                  required
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Immagine Principale {editingProdId && "(Opzionale)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProdFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md bg-black py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none"
              >
                {editingProdId ? "Salva Modifiche" : "Crea Prodotto"}
              </button>
              {editingProdId && (
                <button
                  type="button"
                  onClick={resetProdForm}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Annulla
                </button>
              )}
            </div>
          </form>

          {/* Tabella Prodotti + Paginazione */}
          <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prezzo
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">
                      Stato
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {productsList.map((prod) => (
                    <tr
                      key={prod.idProduct}
                      className={
                        editingProdId === prod.idProduct ? "bg-gray-50" : ""
                      }
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {prod.name}
                        {prod.highlighted && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Top
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        € {prod.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {prod.category?.name || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm hidden sm:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            prod.availability === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {prod.availability === "AVAILABLE"
                            ? "Disponibile"
                            : "Esaurito"}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => startEditProduct(prod)}
                          className="text-black hover:underline mr-4 font-medium cursor-pointer"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.idProduct)}
                          className="text-red-600 hover:text-red-900 font-medium cursor-pointer"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Nessun prodotto trovato.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Barra Paginazione */}
            {productsList.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando da{" "}
                      <span className="font-medium">
                        {prodPage * PAGE_SIZE + 1}
                      </span>{" "}
                      a{" "}
                      <span className="font-medium">
                        {Math.min(
                          (prodPage + 1) * PAGE_SIZE,
                          prodTotalElements
                        )}
                      </span>{" "}
                      di{" "}
                      <span className="font-medium">{prodTotalElements}</span>{" "}
                      risultati
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={handlePrevPage}
                        disabled={prodPage === 0}
                        className={`relative inline-flex items-center rounded-l-md border px-2 py-2 text-sm font-medium ${
                          prodPage === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                        }`}
                      >
                        Precedente
                      </button>
                      <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                        Pagina {prodPage + 1} di {prodTotalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={prodPage >= prodTotalPages - 1}
                        className={`relative inline-flex items-center rounded-r-md border px-2 py-2 text-sm font-medium ${
                          prodPage >= prodTotalPages - 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                        }`}
                      >
                        Successiva
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
