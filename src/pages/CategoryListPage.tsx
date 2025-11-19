import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../services/api";
import type { Category } from "../types/api";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchCategories();
        setCategories(response.content);
      } catch (err) {
        console.error("Errore caricamento categorie", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (isLoading)
    return <div className="p-20 text-center">Caricamento categorie...</div>;

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tutte le Categorie
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Esplora il nostro catalogo diviso per collezioni.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {categories.map((cat) => (
            <Link
              key={cat.idCategory}
              to={`/category/${cat.slug}`}
              className="group"
            >
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <img
                  src={
                    cat.coverImageUrl ||
                    `https://placehold.co/600x600?text=${cat.name}`
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
