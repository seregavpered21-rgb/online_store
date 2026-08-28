import { AuthForm } from "@/components/auth/auth-form";
import { StoreHeader } from "@/components/layout/store-header";

export default function SignInPage() { return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Willkommen zurück</p><h1>Anmelden</h1><AuthForm mode="sign-in" /></section></main>; }