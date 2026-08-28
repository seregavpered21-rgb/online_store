import { redirect } from "next/navigation";

import { StoreHeader } from "@/components/layout/store-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await import("next/headers").then(({ headers }) => headers()) });
  if (!session) redirect("/sign-in");
  return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Mein Konto</p><h1>Hallo, {session.user.name}</h1><p>{session.user.email}</p><p className="account-note">Deine Bestellungen und Adressen erscheinen hier, sobald die Bestellabwicklung fertig ist.</p><SignOutButton /></section></main>;
}