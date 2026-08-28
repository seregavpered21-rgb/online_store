import { CheckoutForm } from "@/components/cart/checkout-form";
import { StoreHeader } from "@/components/layout/store-header";

export default function CheckoutPage() { return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Fast geschafft</p><h1>Bestellung</h1><p>Du zahlst erst bei Erhalt der Ware.</p><CheckoutForm /></section></main>; }