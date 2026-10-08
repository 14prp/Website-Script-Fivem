import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.license.updateMany({
      where: { userId },
      data: { boundIP: null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
