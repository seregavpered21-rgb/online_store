import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type OrderStatus = "new" | "confirmed" | "fulfilled" | "cancelled";
type RouteContext = { params: Promise<{ id: string }> };
const transitions: Record<OrderStatus, OrderStatus[]> = { new: ["confirmed", "cancelled"], confirmed: ["fulfilled", "cancelled"], fulfilled: [], cancelled: [] };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as { status?: OrderStatus };
  if (!body.status || !Object.hasOwn(transitions, body.status)) return NextResponse.json({ error: "Ungültiger Bestellstatus." }, { status: 400 });
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Bestellung nicht gefunden." }, { status: 404 });
  if (!transitions[order.status].includes(body.status)) return NextResponse.json({ error: "Dieser Statuswechsel ist nicht erlaubt." }, { status: 409 });
  await db.update(orders).set({ status: body.status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return NextResponse.json({ status: body.status });
}