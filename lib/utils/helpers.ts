
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
