export function getRequestIP(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  const realIp = req.headers.get("x-real-ip") || "";
  const ip = first || realIp;

  return ip || null;
}
