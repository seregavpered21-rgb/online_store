import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

const escapeCsv = (value: string | number | Date | null) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const rows = [["Bestellnummer", "Datum", "E-Mail", "Status", "Gesamt EUR", "Lieferadresse", "Interne Notiz"], ...orderList.map((order) => [order.orderNumber, order.createdAt.toISOString(), order.email, order.status, (order.totalInCents / 100).toFixed(2), order.deliveryAddress, order.adminNote])];
  return new NextResponse(rows.map((row) => row.map(escapeCsv).join(";")).join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=warenladen-bestellungen.csv" } });
}