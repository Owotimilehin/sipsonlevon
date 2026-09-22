export type Category = "womenswear" | "unisex" | "tailoring" | "outerwear";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  description: string;
  fabric: string;
  images: string[];
  sizes: string[];
  stock: Record<string, number>;
  featured: boolean;
  published: boolean;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  size: string;
  qty: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

export type PaymentProvider = "opay" | "manual";

export type Payment = {
  provider: PaymentProvider;
  reference: string;
  orderNo?: string;
  status: "initial" | "pending" | "success" | "failed" | "closed";
  amount: number;
  currency: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  /** Set when the order was placed by a signed-in customer. Guests have none. */
  userId?: string;
  /** Guards against returning the same units to the rail twice. */
  stockRestored?: boolean;
  payment?: Payment;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
};

export type DbShape = {
  products: Product[];
  orders: Order[];
  users: User[];
};
