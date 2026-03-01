export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const oneDay = 86400000;

  if (diff < oneDay && date.getDate() === now.getDate()) return "Today";
  if (diff < 2 * oneDay) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(str, max = 40) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}
