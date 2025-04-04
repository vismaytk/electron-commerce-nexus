
export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  description: string;
  features?: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  specifications?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}
