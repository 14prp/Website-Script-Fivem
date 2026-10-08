import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const productId = url.searchParams.get("productId") || undefined;

  try {
    const items = await prisma.license.findMany({
      where: {
        userId,
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        licenseKey: true,
        boundIP: true,
        expiresAt: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            version: true,
            points: true,
            imageURL: true,
            embedURL: true,
            downloadURL: true,
            isFeatured: true,
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
