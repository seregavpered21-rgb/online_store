"use client";

import Link from "next/link";

import { useCart } from "./cart-provider";

export function CartLink() {
  const { itemCount } = useCart();
  return <Link className="cart-link" href="/cart">Warenkorb <span>{itemCount}</span></Link>;
}