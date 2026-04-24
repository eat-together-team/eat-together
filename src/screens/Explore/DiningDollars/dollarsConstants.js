export const DOLLARS_LOCATIONS = [
  { id: "rotunda", label: "The Rotunda", short: "TR" },
  { id: "SB_suzzalo", label: "Starbucks (Suzzalo)", short: "SB" },
  { id: "SB_populationHealth", label: "Starbucks (Population Health)", short: "SB" },
  { id: "byGeorgeCafe", label: "By George Cafe", short: "BG" },
  { id: "orinsPlace", label: "Orin's Place", short: "OP" },
  { id: "microsoftCafe", label: "Microsoft Cafe", short: "MC" },
];

export const DOLLARS_PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", badge: "Z", color: "#5B2BD3" },
  { id: "cash", label: "Cash", badge: "$", color: "#19C85B" },
  { id: "venmo", label: "Venmo", badge: "V", color: "#2D8CFF" },
  { id: "cashapp", label: "Cash App", badge: "C", color: "#0DBF4B" },
];

export const DOLLARS_PAYMENT_HIGHLIGHT_COLORS = {
  zelle: "#C4A1F1",
  venmo: "#A1CCF0",
  cashapp: "#9DF2B1",
  cash: "#A1DDBB",
};

export const DOLLARS_PAYMENT_BADGE_STYLE = {
  Z: { backgroundColor: "#5B2BD3" },
  V: { backgroundColor: "#2D8CFF" },
  $: { backgroundColor: "#19C85B" },
  C: { backgroundColor: "#0DBF4B" },
};

export const dollarsPaymentMethodToBadge = (method) => {
  const m = String(method || "").toLowerCase();
  if (m === "zelle") return "Z";
  if (m === "venmo") return "V";
  if (m === "cash") return "$";
  if (m === "cashapp") return "C";
  return null;
};

