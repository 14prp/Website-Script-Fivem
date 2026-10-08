import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getRequestIP } from "@/lib/request-ip";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    licenseKey?: unknown;
  } | null;

  const licenseKey =
    typeof body?.licenseKey === "string" ? body.licenseKey.trim() : "";

  if (!licenseKey) {
    return NextResponse.json(
      { ok: false, error: "Bad Request" },
      { status: 400 },
    );
  }

  const ip = getRequestIP(req);

  try {
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      select: {
        id: true,
        licenseKey: true,
        boundIP: true,
        expiresAt: true,
        userId: true,
        product: {
          select: {
            id: true,
            name: true,
            downloadURL: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }

    const now = new Date();

    if (license.expiresAt && license.expiresAt <= now) {
      return NextResponse.json(
        { ok: false, error: "Expired" },
        { status: 403 },
      );
    }

    if (!ip) {
      return NextResponse.json({ ok: false, error: "No IP" }, { status: 400 });
    }

    if (license.boundIP && license.boundIP !== ip) {
      return NextResponse.json(
        { ok: false, error: "IP mismatch", boundIP: license.boundIP },
        { status: 403 },
      );
    }

    if (!license.boundIP) {
      await prisma.license.update({
        where: { id: license.id },
        data: { boundIP: ip },
      });
    }

    return NextResponse.json({
      ok: true,
      licenseKey: license.licenseKey,
      boundIP: license.boundIP || ip,
      expiresAt: license.expiresAt,
      product: license.product,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database not ready" },
      { status: 500 },
    );
  }
}
