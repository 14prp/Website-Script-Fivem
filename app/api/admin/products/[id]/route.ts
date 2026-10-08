import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizeEmbedURL } from "@/lib/youtube";

function normalizeString(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeBoolean(v: unknown) {
  return v === true;
}

function normalizePoints(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0
    ? Math.floor(v)
    : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const name = normalizeString(body?.name);
  const description = normalizeString(body?.description);
  const detailText = normalizeString(body?.detailText) || null;
  const featuresA = normalizeString(body?.featuresA) || null;
  const featuresB = normalizeString(body?.featuresB) || null;
  const category = normalizeString(body?.category);
  const version = normalizeString(body?.version) || null;
  const imageURL = normalizeString(body?.imageURL) || null;
  const embedURL = normalizeEmbedURL(normalizeString(body?.embedURL)) || null;
  const downloadURL = normalizeString(body?.downloadURL) || null;
  const isActive =
    body?.isActive === undefined ? true : normalizeBoolean(body?.isActive);
  const isFeatured =
    body?.isFeatured === undefined ? false : normalizeBoolean(body?.isFeatured);
  const points = normalizePoints(body?.points);

  if (!name || !description || !category || points === null) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        detailText,
        featuresA,
        featuresB,
        category,
        version,
        imageURL,
        embedURL,
        downloadURL,
        isActive,
        isFeatured,
        points,
      },
      select: {
        id: true,
        name: true,
        description: true,
        detailText: true,
        featuresA: true,
        featuresB: true,
        category: true,
        version: true,
        points: true,
        imageURL: true,
        embedURL: true,
        downloadURL: true,
        isActive: true,
        isFeatured: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
