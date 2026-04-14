export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatTime(value) {
  if (!value) {
    return "-";
  }

  const [hours = "00", minutes = "00"] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatDateTime(dateValue, timeValue = "00:00") {
  if (!dateValue) {
    return "-";
  }

  const timestamp = `${dateValue}T${timeValue}`;
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

export function titleCase(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getInitials(value = "") {
  const parts = value.split(" ").filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "PM";
}

export function getStatusTone(status = "") {
  const normalized = status.toLowerCase();

  if (normalized === "completed") {
    return "completed";
  }

  if (normalized === "cancelled") {
    return "cancelled";
  }

  return "pending";
}
