export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  description?: string;
  material?: string;
  dimension?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  availability?: "AVAILABLE" | "UNAVAILABLE";
  highlighted?: boolean;
}

// Category
export interface Category {
  idCategory: string;
  name: string;
  description: string;
  slug: string;
  coverImageUrl: string;
}

// ProductImage
export interface ProductImage {
  idProductImage: string;
  imageUrl: string;
  altText: string;
  order: number;
}

// Product
export interface Product {
  idProduct: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  availability: "AVAILABLE" | "UNAVAILABLE";
  highlighted: boolean;
  materials: string;
  dimension: string;
  category: Category;
  productImages: ProductImage[];
}
