import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const maximumImageSize = 4 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !imageTypes.has(file.type) || file.size > maximumImageSize) return NextResponse.json({ error: "Bitte lade ein JPG, PNG, WebP oder GIF bis 4 MB hoch." }, { status: 400 });

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `products/${crypto.randomUUID()}.${extension}`;
  const blob = await put(filename, file, { access: "public", addRandomSuffix: false });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}