"use client";

import { useState } from "react";
import { dictionaries, type Lang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Field } from "@/app/[lang]/checkout/form";

export function AuthForm({ lang, allowSignup = true }: { lang: Lang; allowSignup?: boolean }) {
  const t = dictionaries[lang].account;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    setMsg(null);
    const { data, error } = mode === "login"
      ? await supabase().auth.signInWithPassword({ email, password })
      : await supabase().auth.signUp({ email, password, options: { data: { name: String(f.get("name") ?? "") } } });
    setBusy(false);
    if (error) setMsg(error.message);
    else if (mode === "register" && !data.session) setMsg(t.checkEmail);
  }

  async function google() {
    setBusy(true);
    // Torna alla pagina di partenza (account, checkout o dashboard): l'indirizzo deve essere tra i Redirect URLs di Supabase
    const { error } = await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.href.split("#")[0] } });
    if (error) { setBusy(false); setMsg(error.message); }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-3xl border border-line bg-card p-8">
      <h2 className="font-serif text-3xl">{mode === "login" ? t.login : t.register}</h2>
      <button type="button" onClick={google} disabled={busy} className="btn-ghost w-full bg-card">
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9Z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9Z" />
        </svg>
        {t.google}
      </button>
      <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">{t.or}</p>
      {mode === "register" && <div className="animate-in"><Field label={t.name}><input name="name" required autoComplete="name" className="field" /></Field></div>}
      <Field label="Email"><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Field label={t.password}>
        <input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
      </Field>
      {msg && <p key={msg} role="alert" className="animate-in text-sm text-muted">{msg}</p>}
      <button disabled={busy} className="btn-primary w-full">{mode === "login" ? t.login : t.register}</button>
      {allowSignup && (
        <p className="text-center text-sm text-muted">
          {mode === "login" ? t.noAccount : t.haveAccount}{" "}
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-accent underline">
            {mode === "login" ? t.register : t.login}
          </button>
        </p>
      )}
    </form>
  );
}
