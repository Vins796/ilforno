import { dictionaries, type Lang } from "@/lib/i18n";
import { Logo } from "./header";

export function Footer({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo className="text-fg" />
          <p>{t.visit.address}</p>
          <p>{t.footer.made}</p>
        </div>
        <p>© {/* anno fisso: evita Date() nel prerender */}2026 Il Forno · Poirino. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
