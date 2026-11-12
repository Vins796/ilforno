import type { Lang } from "@/lib/i18n";
import { AccountView } from "./view";

export default async function Account({ params }: PageProps<"/[lang]/account">) {
  return <AccountView lang={(await params).lang as Lang} />;
}
