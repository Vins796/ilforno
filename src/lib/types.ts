export const categories = ["pane", "focacce", "dolci", "torte", "stagionali"] as const;
export type Category = (typeof categories)[number];

export const statuses = ["received", "preparing", "ready", "picked_up", "cancelled"] as const;
export type OrderStatus = (typeof statuses)[number];

export type Product = {
  id: string;
  name_it: string;
  name_en: string;
  description_it: string;
  description_en: string;
  category: Category;
  price_cents: number;
  unit_it: string;
  unit_en: string;
  image_url: string | null;
  available: boolean;
  weekly_special: boolean;
  requires_advance: boolean;
  sort: number;
};

export type OrderItem = { id: string; product_id: string | null; name: string; unit_price_cents: number; quantity: number };

export type Order = {
  id: string;
  number: number;
  user_id: string | null;
  customer_name: string;
  email: string | null;
  phone: string | null;
  pickup_at: string;
  notes: string;
  lang: "it" | "en";
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  order_items?: OrderItem[];
};

export type CartLine = { productId: string; quantity: number };
