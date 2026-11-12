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
