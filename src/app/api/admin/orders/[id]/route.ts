import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/auth/authorization";
import { db } from "@/lib/db/client";
import { sendOrderStatusEmail } from "@/lib/email/orders";
import { canTransitionOrderStatus, isOrderStatus, type OrderStatus } from "@/lib/orders/status";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdminSession(session)) return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as { status?: OrderStatus; adminNote?: string };
  if (body.status === undefined && body.adminNote === undefined) return NextResponse.json({ error: "Keine Änderungen übermittelt." }, { status: 400 });
  if (body.status !== undefined && !isOrderStatus(body.status)) return NextResponse.json({ error: "Ungültiger Bestellstatus." }, { status: 400 });
  if (body.adminNote !== undefined && (typeof body.adminNote !== "string" || body.adminNote.length > 2000)) return NextResponse.json({ error: "Ungültige interne Notiz." }, { status: 400 });
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Bestellung nicht gefunden." }, { status: 404 });
  if (body.status !== undefined && !canTransitionOrderStatus(order.status, body.status)) return NextResponse.json({ error: "Dieser Statuswechsel ist nicht erlaubt." }, { status: 409 });
  await db.update(orders).set({ status: body.status ?? order.status, adminNote: body.adminNote?.trim() || null }).where(eq(orders.id, id));
  if (body.status !== undefined) void sendOrderStatusEmail({ email: order.email, orderNumber: order.orderNumber, totalInCents: order.totalInCents, status: body.status as "confirmed" | "fulfilled" | "cancelled" }).catch(console.error);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return NextResponse.json({ status: body.status ?? order.status });
}