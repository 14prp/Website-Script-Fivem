import { randomBytes } from "node:crypto";

function slugPart(input: string) {
  const cleaned = input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .join("");

  return cleaned.slice(0, 6) || "LIC";
}

function randomGroup(len: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(len);
  let out = "";

  for (let i = 0; i < len; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }

  return out;
}

export function generateLicenseKey(productName: string) {
  const prefix = slugPart(productName);

  return `${prefix}-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}`;
}

export function computeExpiresAt(days: number) {
  const d = new Date();

  d.setDate(d.getDate() + Math.max(0, Math.floor(days)));

  return d;
}
