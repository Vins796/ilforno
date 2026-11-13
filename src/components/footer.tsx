import Link from "next/link";
import { dictionaries, type Lang } from "@/lib/i18n";
import { Logo } from "./header";
import { ConsentSettingsButton } from "./consent";
import { indirizzo, negozio } from "@/lib/negozio";

export function Footer({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo className="text-fg" size={56} />
          <p>{indirizzo(lang)}</p>
          <p><a href={`tel:${negozio.telefono}`} className="hover:text-fg">{negozio.telefonoVisibile}</a></p>
          <p>{t.footer.made}</p>
        </div>
        <div className="space-y-2 sm:text-right">
          <p className="flex gap-4 sm:justify-end">
            <Link href={`/${lang}/privacy`} className="underline-offset-4 hover:text-fg hover:underline">{t.footer.privacy}</Link>
            <ConsentSettingsButton label={t.cookies.settings} />
          </p>
          <p>© {/* anno fisso: evita Date() nel prerender */}2026 {negozio.nome} · {negozio.citta}. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
