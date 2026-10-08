import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { generateLicenseKey } from "@/lib/license";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    licenseKey?: unknown;
    expiresAt?: unknown;
    resetIP?: unknown;
    regenerate?: unknown;
  } | null;

  const resetIP = body?.resetIP === true;
  const regenerate = body?.regenerate === true;
  const licenseKeyInput =
    typeof body?.licenseKey === "string" ? body.licenseKey.trim() : "";
  const expiresAtRaw =
    typeof body?.expiresAt === "string" ? body.expiresAt : null;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const expiresAtValue =
    expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null;

  if (!licenseKeyInput && !resetIP && !regenerate && expiresAtRaw === null) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const current = await prisma.license.findUnique({
      where: { id },
      select: { id: true, product: { select: { name: true } } },
    });

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const licenseKey = regenerate
      ? generateLicenseKey(current.product.name)
      : licenseKeyInput;

    const updated = await prisma.license.update({
      where: { id },
      data: {
        ...(licenseKey ? { licenseKey } : {}),
        expiresAt: expiresAtValue,
        ...(resetIP || regenerate ? { boundIP: null } : {}),
      },
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

  const { id } = await params;

  try {
    await prisma.license.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
