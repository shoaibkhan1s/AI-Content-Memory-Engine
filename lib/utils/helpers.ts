
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function detectPlatform(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "YouTube";
  }

  if (url.includes("instagram.com")) {
    return "Instagram";
  }

  if (url.includes("github.com")) {
    return "GitHub";
  }
  return "Web";
}

export function detectContentType(url: string): string {
  const platform = detectPlatform(url);
  if (platform === "YouTube") return "youtube";
  if (platform === "Instagram") return "instagram";
  return "link";
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    // youtu.be/<id>
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&/]/)?.[0];
      return id || null;
    }

    const u = new URL(url);
    // youtube.com/watch?v=<id>
    const v = u.searchParams.get("v");
    if (v) return v;

    // youtube.com/shorts/<id> or /embed/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

    return null;
  } catch {
    return null;
  }
}

export function getThumbnailUrl(sourceUrl?: string, platform?: string): string | undefined {
  if (!sourceUrl) return undefined;
  const p = platform || detectPlatform(sourceUrl);

  if (p === "YouTube") {
    const id = extractYouTubeVideoId(sourceUrl);
    if (!id) return undefined;
    // Prefer HQ; YouTube will serve best available.
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  return undefined;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Coding: "blue",
    DSA: "indigo",
    Finance: "green",
    Health: "red",
    Productivity: "yellow",
    Education: "purple",
    Personal: "pink",
    General: "gray",
  };
  return colors[category] || "gray";
}
