import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

const NAME_KEY = "site_name";
const DESCRIPTION_KEY = "site_description";

async function getSettings() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [NAME_KEY, DESCRIPTION_KEY] } },
      select: { key: true, value: true },
    });

    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      name: map.get(NAME_KEY) ?? siteConfig.name,
      description: map.get(DESCRIPTION_KEY) ?? siteConfig.description,
    };
  } catch {
    return { name: siteConfig.name, description: siteConfig.description };
  }
}

async function setSettings(input: { name: string; description: string }) {
  const name = input.name.trim() || siteConfig.name;
  const description = input.description.trim() || siteConfig.description;

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: NAME_KEY },
      create: { key: NAME_KEY, value: name },
      update: { value: name },
    }),
    prisma.siteSetting.upsert({
      where: { key: DESCRIPTION_KEY },
      create: { key: DESCRIPTION_KEY, value: description },
      update: { value: description },
    }),
  ]);

  return { name, description };
}

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings();

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    name?: unknown;
    description?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name : "";
  const description =
    typeof body?.description === "string" ? body.description : "";

  try {
    const updated = await setSettings({ name, description });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
