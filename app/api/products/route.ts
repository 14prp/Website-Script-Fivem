import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
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
      take: 500,
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
