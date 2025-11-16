import type { Product } from "../types/api";
import { Link } from "react-router-dom";

// Formatto il prezzo in Euro
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Prende la prima immagine (o un placeholder)
  const primaryImage =
    product.productImages && product.productImages.length > 0
      ? product.productImages[0].imageUrl
      : `https://placehold.co/600x400/E2E8F0/2D3748?text=${product.name.replace(
          " ",
          "+"
        )}`;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-6 text-center">
        {product.highlighted && (
          <span className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
            In Evidenza
          </span>
        )}

        {/* Nome Prodotto */}
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          {product.name}
        </h3>

        {/* Prezzo (formattato) */}
        <p className="mt-2 text-base font-bold text-gray-800">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
