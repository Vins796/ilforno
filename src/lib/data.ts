import { cacheLife, cacheTag } from "next/cache";
import { supabase, supabaseConfigured } from "./supabase";
import type { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products"); // invalidato dalla dashboard a ogni modifica
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase().from("products").select("*").order("sort");
  if (error) throw error;
  return data as Product[];
}
