import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

/** Client pubblico (anon). Nel browser mantiene la sessione dell'utente in localStorage. */
export function supabase(): SupabaseClient {
  if (!url || !anon) throw new Error("Supabase non configurato: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
  client ??= createClient(url, anon, { auth: { persistSession: typeof window !== "undefined" } });
  return client;
}
