import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        points: true,
      },
      orderBy: { id: "desc" },
      take: 200,
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
