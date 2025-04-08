
export interface Product {
  id: string;
  name: string;
  category: string | null;
  stock: number;
  price: number;
}

export interface NewProduct {
  name: string;
  category: string | null;
  stock: number;
  price: number;
}
