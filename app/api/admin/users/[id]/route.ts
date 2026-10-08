import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeRole(role: unknown) {
  return role === "admin" ? "admin" : "user";
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
  const body = (await req.json().catch(() => null)) as {
    points?: unknown;
    role?: unknown;
  } | null;

  const role = normalizeRole(body?.role);
  const pointsRaw = typeof body?.points === "number" ? body.points : null;
  const points =
    typeof pointsRaw === "number" &&
    Number.isFinite(pointsRaw) &&
    pointsRaw >= 0
      ? Math.floor(pointsRaw)
      : undefined;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        role,
        ...(points !== undefined ? { points } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        points: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
