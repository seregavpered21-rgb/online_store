"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const result = isSignUp
      ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
      : await authClient.signIn.email({ email, password });
    setLoading(false);
    if (result.error) return setError(result.error.message ?? "Etwas ist schiefgelaufen.");
    router.push("/account");
    router.refresh();
  }

  return <form className="auth-form" onSubmit={handleSubmit}>
    {isSignUp ? <label>Name<input name="name" required /></label> : null}
    <label>E-Mail-Adresse<input autoComplete="email" name="email" required type="email" /></label>
    <label>Passwort<input autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} name="password" required type="password" /></label>
    {error ? <p className="form-error">{error}</p> : null}
    <button className="primary-action" disabled={loading} type="submit">{loading ? "Einen Moment..." : isSignUp ? "Konto erstellen" : "Anmelden"}</button>
    <p>{isSignUp ? "Schon ein Konto?" : "Noch kein Konto?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Anmelden" : "Registrieren"}</Link></p>
  </form>;
}