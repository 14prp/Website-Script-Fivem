import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 },
    );
  }

  const maxBytes = 10 * 1024 * 1024;

  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const extFromName = path.extname(file.name || "").toLowerCase();
  const extFromType =
    file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
        ? ".webp"
        : file.type === "image/jpeg"
          ? ".jpg"
          : "";

  const ext = extFromType || extFromName || ".png";
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

  await mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();

  await writeFile(path.join(uploadDir, filename), new Uint8Array(arrayBuffer));

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
