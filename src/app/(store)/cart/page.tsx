import { StoreHeader } from "@/components/layout/store-header";
import { CartPage } from "@/components/cart/cart-page";

export default function CartRoute() {
  return <main><StoreHeader /><section className="catalog cart-page" aria-labelledby="cart-title"><p className="eyebrow">Deine Auswahl</p><h1 className="page-title" id="cart-title">Warenkorb</h1><CartPage /></section></main>;
}