"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

/** undefined = ancora in caricamento, null = non loggato */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(supabaseConfigured ? undefined : null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

/**
 * true se l'utente loggato è abilitato alla dashboard (riga in public.staff, leggibile solo da sé stesso).
 * undefined finché non lo sappiamo, così chi lo usa può evitare di mostrare qualcosa e poi toglierlo.
 */
export function useIsStaff(): boolean | undefined {
  const session = useSession();
  const [result, setResult] = useState<{ userId: string; staff: boolean } | null>(null);
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    supabase().from("staff").select("user_id").eq("user_id", userId).maybeSingle()
      .then(({ data }) => setResult({ userId, staff: !!data }));
  }, [userId]);
  if (session === undefined) return undefined;
  if (!userId) return false;
  return result?.userId === userId ? result.staff : undefined;
}
