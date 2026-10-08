function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0] || "";

      return id || null;
    }

    if (u.hostname.endsWith("youtube.com")) {
      const parts = u.pathname.split("/").filter(Boolean);

      if (u.pathname.startsWith("/watch")) {
        const id = u.searchParams.get("v") || "";

        return id || null;
      }

      if (parts[0] === "embed" && parts[1]) {
        return parts[1];
      }

      if (parts[0] === "shorts" && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeEmbedURL(input: string | null | undefined) {
  const raw = (input || "").trim();

  if (!raw) return null;

  const id = extractYouTubeId(raw);

  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  try {
    const u = new URL(raw);

    if (u.hostname.endsWith("youtube.com") && u.pathname.includes("/embed/")) {
      u.hostname = "www.youtube-nocookie.com";

      return u.toString();
    }
  } catch {
    return raw;
  }

  return raw;
}
