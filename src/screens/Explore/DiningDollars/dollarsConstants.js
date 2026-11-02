// `id` is what gets stored in Firestore (`preferredLocations`); ids from the original
// six locations are kept so older posts still resolve. `summary` is the short name used
// in the card's locations line ("HUB, Cultivate, Local Point, +17 more").
export const DOLLARS_LOCATIONS = [
  { id: "rotunda", label: "The Rotunda", summary: "Rotunda" },
  { id: "byGeorgeCafe", label: "By George Cafe", summary: "By George" },
  { id: "SB_suzzalo", label: "Starbucks (Suzzalo)", summary: "Starbucks (Suzzalo)" },
  { id: "SB_populationHealth", label: "Starbucks (Population Health)", summary: "Starbucks (Pop Health)" },
  { id: "microsoftCafe", label: "Microsoft Cafe", summary: "Microsoft Cafe" },
  { id: "orinsPlace", label: "Orin's Place", summary: "Orin's Place" },
  { id: "centerTable", label: "Center Table", summary: "Center Table" },
  { id: "localPoint", label: "Local Point", summary: "Local Point" },
  { id: "cultivate", label: "Cultivate", summary: "Cultivate" },
  { id: "huskyDen", label: "Husky Den Food Court", summary: "Husky Den" },
  { id: "districtMarketOak", label: "District Market (Oak)", summary: "District Market (Oak)" },
  { id: "districtMarketAlder", label: "District Market (Alder)", summary: "District Market (Alder)" },
  { id: "etcHub", label: "Etc (HUB)", summary: "HUB" },
  { id: "huskyGrindOak", label: "Husky Grind Cafe (Oak)", summary: "Husky Grind (Oak)" },
  { id: "huskyGrindMercer", label: "Husky Grind Cafe (Mercer Court)", summary: "Husky Grind (Mercer)" },
  { id: "publicGrounds", label: "Public Grounds", summary: "Public Grounds" },
];

export const DOLLARS_PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", badge: "Z", color: "#5B2BD3" },
  { id: "venmo", label: "Venmo", badge: "V", color: "#2D8CFF" },
  { id: "cash", label: "Cash", badge: "$", color: "#19C85B" },
  { id: "cashapp", label: "Cash App", badge: "C", color: "#0DBF4B" },
];

const locationsById = Object.fromEntries(DOLLARS_LOCATIONS.map((l) => [l.id, l]));
const paymentsById = Object.fromEntries(DOLLARS_PAYMENT_METHODS.map((p) => [p.id, p]));

export const getDollarsLocation = (id) => locationsById[id] || null;

export const getDollarsPaymentMethod = (id) => paymentsById[String(id || "").toLowerCase()] || null;

/** "HUB, Cultivate, Local Point, +17 more" */
export function summarizeDollarsLocations(ids, maxShown = 3) {
  const names = (ids || []).map((id) => getDollarsLocation(id)?.summary).filter(Boolean);
  if (names.length <= maxShown) return names.join(", ");
  return `${names.slice(0, maxShown).join(", ")}, +${names.length - maxShown} more`;
}
