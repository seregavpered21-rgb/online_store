import { Resend } from "resend";

type OrderEmail = { email: string; orderNumber: string; totalInCents: number; status?: "confirmed" | "fulfilled" | "cancelled" };

const formatPrice = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : undefined;
}

export async function sendOrderConfirmation({ email, orderNumber, totalInCents }: OrderEmail) {
  const resend = client();
  if (!resend || !process.env.EMAIL_FROM) return;
  await resend.emails.send({ from: process.env.EMAIL_FROM, to: email, subject: `Bestellbestätigung ${orderNumber}`, text: `Vielen Dank für deine Bestellung bei Warenladen. Deine Bestellnummer lautet ${orderNumber}. Gesamt: ${formatPrice(totalInCents)}. Wir melden uns zeitnah zur Bestätigung und Abstimmung der Lieferung oder Abholung.` });
}

export async function sendOrderStatusEmail({ email, orderNumber, status }: OrderEmail) {
  const resend = client();
  if (!resend || !process.env.EMAIL_FROM || !status) return;
  const messages = { confirmed: "Deine Bestellung wurde bestätigt.", fulfilled: "Deine Bestellung ist erfüllt und zur Abholung oder Zustellung bereit.", cancelled: "Deine Bestellung wurde storniert." };
  await resend.emails.send({ from: process.env.EMAIL_FROM, to: email, subject: `Update zu deiner Bestellung ${orderNumber}`, text: `Warenladen: ${messages[status]} Bestellnummer: ${orderNumber}.` });
}