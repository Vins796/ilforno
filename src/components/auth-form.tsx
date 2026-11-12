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

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-3xl border border-line bg-card p-8">
      <h2 className="font-serif text-3xl">{mode === "login" ? t.login : t.register}</h2>
      {mode === "register" && <Field label={t.name}><input name="name" required autoComplete="name" className="field" /></Field>}
      <Field label="Email"><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Field label={t.password}>
        <input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
      </Field>
      {msg && <p role="alert" className="text-sm text-muted">{msg}</p>}
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
