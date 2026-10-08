import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";

const NAME_KEY = "site_name";
const DESCRIPTION_KEY = "site_description";

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [NAME_KEY, DESCRIPTION_KEY] } },
      select: { key: true, value: true },
    });

    const map = new Map(rows.map((r) => [r.key, r.value]));

    return NextResponse.json({
      name: map.get(NAME_KEY) ?? siteConfig.name,
      description: map.get(DESCRIPTION_KEY) ?? siteConfig.description,
    });
  } catch {
    return NextResponse.json({
      name: siteConfig.name,
      description: siteConfig.description,
    });
  }
}
