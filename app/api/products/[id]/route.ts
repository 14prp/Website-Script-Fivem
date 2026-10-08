import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
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
        isFeatured: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
