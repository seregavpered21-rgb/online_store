import Link from "next/link";

import { StoreHeader } from "@/components/layout/store-header";

type OrderSuccessProps = { searchParams: Promise<{ number?: string }> };
export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) { const { number } = await searchParams; return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Vielen Dank</p><h1>Deine Bestellung ist bei uns.</h1><p>Bestellnummer: <strong>{number ?? "wird vorbereitet"}</strong></p><p className="account-note">Wir melden uns zeitnah zur Bestätigung und zur Abstimmung der Lieferung oder Abholung.</p><Link className="primary-action" href="/products">Weiter einkaufen</Link></section></main>; }