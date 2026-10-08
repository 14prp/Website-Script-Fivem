import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { computeExpiresAt, generateLicenseKey } from "@/lib/license";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.license.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        licenseKey: true,
        boundIP: true,
        expiresAt: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        product: {
          select: { id: true, name: true, category: true, version: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    userId?: unknown;
    productId?: unknown;
    expiresDays?: unknown;
    expiresAt?: unknown;
    licenseKey?: unknown;
  } | null;

  const userId = typeof body?.userId === "string" ? body.userId : "";
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const expiresDays =
    typeof body?.expiresDays === "number" && Number.isFinite(body.expiresDays)
      ? Math.floor(body.expiresDays)
      : 30;
  const expiresAtRaw =
    typeof body?.expiresAt === "string" ? body.expiresAt : null;
  const expiresAtParsed = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const licenseKeyInput =
    typeof body?.licenseKey === "string" ? body.licenseKey.trim() : "";

  if (!userId || !productId) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const licenseKey = licenseKeyInput || generateLicenseKey(product.name);
    const expiresAt =
      expiresAtParsed && !Number.isNaN(expiresAtParsed.getTime())
        ? expiresAtParsed
        : expiresDays > 0
          ? computeExpiresAt(expiresDays)
          : null;

    const created = await prisma.license.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, licenseKey, expiresAt },
      update: { licenseKey, expiresAt },
      select: {
        id: true,
        licenseKey: true,
        boundIP: true,
        expiresAt: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        product: {
          select: { id: true, name: true, category: true, version: true },
        },
      },
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
