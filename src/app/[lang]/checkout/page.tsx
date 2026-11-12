import type { Lang } from "@/lib/i18n";
import { CheckoutForm } from "./form";

export default async function Checkout({ params }: PageProps<"/[lang]/checkout">) {
  return <CheckoutForm lang={(await params).lang as Lang} />;
}
