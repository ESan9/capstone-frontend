import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import type {
  Category,
  Product,
  NewCategoryDTO,
  NewProductDTO,
  ProductImage,
} from "../types/api";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // GESTIONE TAB ATTIVO
  const [activeTab, setActiveTab] = useState<"category" | "product">(
    "category"
  );

  // GESTIONE MESSAGGI (Successo/Errore)
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // --- STATI DATI (Liste dal Backend) ---
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // --- PAGINAZIONE PRODOTTI ---
  const [prodPage, setProdPage] = useState(0);
  const [prodTotalPages, setProdTotalPages] = useState(0);
  const [prodTotalElements, setProdTotalElements] = useState(0);
  const PAGE_SIZE = 8;

  // --- STATI PER MODIFICA (ID dell'elemento selezionato) ---
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  // ==========================================
  // STATI FORM CATEGORIA
  // ==========================================
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catFile, setCatFile] = useState<File | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

  // ==========================================
  // STATI FORM PRODOTTO
  // ==========================================
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");

  // MULTI-IMAGE: Nuovi file selezionati dall'utente per l'upload
  const [prodFiles, setProdFiles] = useState<File[]>([]);

  // MULTI-IMAGE: Immagini già presenti nel DB (per visualizzazione in modifica)
  const [prodExistingImages, setProdExistingImages] = useState<ProductImage[]>(
    []
  );

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

  // 2. Fetch Data
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

  useEffect(() => {
    if (user) {
      if (activeTab === "category") refreshCategories();
      if (activeTab === "product") refreshProducts();
    }
  }, [user, activeTab, refreshCategories, refreshProducts]);

  // --- RESET FORMS ---
  const resetCatForm = () => {
    setCatName("");
    setCatDesc("");
    setCatFile(null);
    setCatImagePreview(null);
    setEditingCatId(null);
  };

  const resetProdForm = () => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdCategory("");
    setProdFiles([]);
    setProdExistingImages([]);
    setProdAvailability("AVAILABLE");
    setProdHighlighted(false);
    setProdMaterials("");
    setProdDimension("");
    setEditingProdId(null);

    const fileInput = document.getElementById(
      "prod-file-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // ==========================================
  // LOGICA CATEGORIE
  // ==========================================
  const startEditCategory = (cat: Category) => {
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatImagePreview(cat.coverImageUrl || null);
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
        coverImageUrl: "",
      };
      let categoryId = editingCatId;

      if (editingCatId) {
        await api.updateCategory(editingCatId, catDTO);
        setMessage({ type: "success", text: "Categoria aggiornata!" });
      } else {
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
          text: "Impossibile eliminare: categoria in uso.",
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

    if (prod.productImages && prod.productImages.length > 0) {
      setProdExistingImages(prod.productImages);
    } else {
      setProdExistingImages([]);
    }

    setEditingProdId(prod.idProduct);
    window.scrollTo(0, 0);
    setMessage(null);
  };

  const handleProdFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setProdFiles(selectedFiles);
    }
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
        await api.updateProduct(editingProdId, prodDTO);
      } else {
        const newProd = await api.createProduct(prodDTO);
        productId = newProd.idProduct;
      }

      if (prodFiles.length > 0 && productId) {
        try {
          const uploadPromises = prodFiles.map((file) =>
            api.uploadProductImage(productId!, file)
          );
          await Promise.all(uploadPromises);
        } catch (imgErr) {
          console.error("Errore upload multiplo", imgErr);
          const imgErrorText = api.getErrorMessage(imgErr);
          setMessage({
            type: "error",
            text: `Prodotto salvato, ma errore immagini: ${imgErrorText}`,
          });
          resetProdForm();
          refreshProducts();
          return;
        }
      }

      setMessage({
        type: "success",
        text:
          productId === editingProdId
            ? "Prodotto aggiornato con successo!"
            : "Prodotto creato con successo!",
      });

      resetProdForm();
      refreshProducts();
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
      setMessage({ type: "error", text: errorText });
    }
  };

  // Helpers Paginazione
  const handlePrevPage = () => {
    if (prodPage > 0) setProdPage(prodPage - 1);
  };
  const handleNextPage = () => {
    if (prodPage < prodTotalPages - 1) setProdPage(prodPage + 1);
  };

  if (isLoading || !user)
    return <div className="p-10 text-center">Caricamento dashboard...</div>;

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm("Vuoi davvero eliminare questa foto?")) return;

    try {
      await api.deleteProductImage(imageId);

      setProdExistingImages((prev) =>
        prev.filter((img) => img.idProductImage !== imageId)
      );

      setMessage({
        type: "success",
        text: "Immagine eliminata correttamente.",
      });
    } catch (err) {
      const errorText = api.getErrorMessage(err);
      setMessage({ type: "error", text: errorText });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Admin
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Ciao, <span className="font-semibold">{user.name}</span>.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 md:mt-0 text-sm font-medium text-black hover:underline flex items-center cursor-pointer"
        >
          &larr; Torna al negozio
        </button>
      </div>

      {/* TABS */}
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
                : "border-transparent text-gray-500"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer`}
          >
            Categorie
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
                : "border-transparent text-gray-500"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer`}
          >
            Prodotti
          </button>
        </nav>
      </div>

      {/* MESSAGGI */}
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

      {/* ================= TAB CATEGORIE ================= */}
      {activeTab === "category" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* FORM */}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Immagine Copertina
                </label>

                {/* PREVIEW */}
                {catImagePreview && (
                  <div className="mb-3 h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img
                      src={catImagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* BOTTONE CUSTOM */}
                <div className="mt-2">
                  <label
                    htmlFor="cat-file-upload"
                    className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Icona */}
                    <svg
                      className="mr-2 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>

                    {catFile ? catFile.name : "Scegli un file..."}

                    <input
                      id="cat-file-upload"
                      name="cat-file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only" // nasconde l'input visivamente ma lo lascia accessibile
                      onChange={(e) =>
                        setCatFile(e.target.files ? e.target.files[0] : null)
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 justify-center rounded-md bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 cursor-pointer"
                >
                  {editingCatId ? "Aggiorna" : "Crea"}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCatForm}
                    className="flex-1 justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* TABELLA CATEGORIE */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900">
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
                          className="text-black hover:underline mr-4 cursor-pointer"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.idCategory)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
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

      {/* ================= TAB PRODOTTI ================= */}
      {activeTab === "product" && (
        <div className="flex flex-col gap-8">
          {/* FORM PRODOTTO */}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white cursor-pointer"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white cursor-pointer"
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
                  required
                  value={prodMaterials}
                  onChange={(e) => setProdMaterials(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Dimensioni
                </label>
                <input
                  type="text"
                  required
                  value={prodDimension}
                  onChange={(e) => setProdDimension(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div className="sm:col-span-6 flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                <input
                  id="highlighted"
                  type="checkbox"
                  checked={prodHighlighted}
                  onChange={(e) => setProdHighlighted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>

              {/* --- SEZIONE GALLERY --- */}
              <div className="sm:col-span-6 border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-900 mb-4">
                  Galleria Immagini
                </label>

                {/* A. IMMAGINI ESISTENTI */}
                {prodExistingImages.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">
                      Attualmente nel catalogo:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {prodExistingImages.map((img) => (
                        <div
                          key={img.idProductImage}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.altText || "Prodotto"}
                            className="h-full w-full object-cover"
                          />

                          {/* BOTTONE ELIMINA (X) */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(img.idProductImage)
                            }
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none cursor-pointer"
                            title="Elimina foto"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Upload Nuovi File */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-700 font-medium">
                    Aggiungi nuove foto
                  </label>

                  {/* BOTTONE CUSTOM MULTI-UPLOAD */}
                  <label
                    htmlFor="prod-file-input"
                    className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <svg
                      className="mr-2 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>

                    {/* Testo dinamico */}
                    {prodFiles.length > 0
                      ? `${prodFiles.length} file selezionati`
                      : "Clicca per selezionare le immagini..."}

                    <input
                      id="prod-file-input"
                      type="file"
                      accept="image/*"
                      multiple // Multi-selezione attiva
                      className="sr-only"
                      onChange={handleProdFilesChange}
                    />
                  </label>

                  <p className="text-xs text-gray-500">
                    Tieni premuto CTRL (o CMD su Mac) per selezionare più file
                    contemporaneamente.
                  </p>

                  {/* PREVIEW NUOVI FILE */}
                  {prodFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Pronte per l'upload ({prodFiles.length}):
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {prodFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="h-full w-full object-cover opacity-80"
                              onLoad={() => URL.revokeObjectURL(file.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md bg-black py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-gray-800 cursor-pointer"
              >
                {editingProdId ? "Salva Modifiche" : "Crea Prodotto"}
              </button>
              {editingProdId && (
                <button
                  type="button"
                  onClick={resetProdForm}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                >
                  Annulla
                </button>
              )}
            </div>
          </form>

          {/* TABELLA PRODOTTI */}
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
                        <div className="flex items-center gap-3">
                          {prod.productImages &&
                          prod.productImages.length > 0 ? (
                            <img
                              src={prod.productImages[0].imageUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                              NA
                            </div>
                          )}
                          <div>
                            {prod.name}
                            {prod.highlighted && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                Top
                              </span>
                            )}
                          </div>
                        </div>
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
                          className="text-black hover:underline mr-4 cursor-pointer"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.idProduct)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Nessun prodotto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginazione Prodotti */}
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
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={handlePrevPage}
                      disabled={prodPage === 0}
                      className={`relative inline-flex items-center rounded-l-md border px-2 py-2 text-sm font-medium cursor-pointer ${
                        prodPage === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      Precedente
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={prodPage >= prodTotalPages - 1}
                      className={`relative inline-flex items-center rounded-r-md border px-2 py-2 text-sm font-medium cursor-pointer ${
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
