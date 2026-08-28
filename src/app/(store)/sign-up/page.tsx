import { AuthForm } from "@/components/auth/auth-form";
import { StoreHeader } from "@/components/layout/store-header";

export default function SignUpPage() { return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Dein Warenladen</p><h1>Konto erstellen</h1><AuthForm mode="sign-up" /></section></main>; }