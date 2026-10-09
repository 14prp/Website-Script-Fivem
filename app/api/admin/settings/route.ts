import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const updated = await saveSiteSettings(body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
