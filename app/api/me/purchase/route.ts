import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { computeExpiresAt, generateLicenseKey } from "@/lib/license";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    productId?: unknown;
  } | null;
  const productId = typeof body?.productId === "string" ? body.productId : "";

  if (!productId) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, isActive: true },
        select: {
          id: true,
          name: true,
          points: true,
          version: true,
          imageURL: true,
          embedURL: true,
        },
      });

      if (!product) {
        return { ok: false as const, status: 404 as const, error: "Not found" };
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true },
      });

      if (!user) {
        return {
          ok: false as const,
          status: 401 as const,
          error: "Unauthorized",
        };
      }

      const existing = await tx.license.findUnique({
        where: { userId_productId: { userId, productId } },
        select: {
          id: true,
          licenseKey: true,
          expiresAt: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const isExpired = existing?.expiresAt ? existing.expiresAt <= now : false;

      if (existing && !isExpired) {
        return {
          ok: true as const,
          status: 200 as const,
          license: existing,
          product,
          deductedPoints: 0,
        };
      }

      if (user.points < product.points) {
        return {
          ok: false as const,
          status: 400 as const,
          error: "Not enough points",
        };
      }

      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: product.points } },
      });

      const expiresAt = computeExpiresAt(30);
      const licenseKey = generateLicenseKey(product.name);

      const license = await tx.license.upsert({
        where: { userId_productId: { userId, productId } },
        create: {
          userId,
          productId,
          licenseKey,
          boundIP: null,
          expiresAt,
        },
        update: {
          licenseKey,
          boundIP: null,
          expiresAt,
        },
        select: {
          id: true,
          licenseKey: true,
          boundIP: true,
          expiresAt: true,
          createdAt: true,
        },
      });

      return {
        ok: true as const,
        status: 200 as const,
        license,
        product,
        deductedPoints: product.points,
      };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
