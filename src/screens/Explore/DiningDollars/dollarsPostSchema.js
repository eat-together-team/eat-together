import firebase from "firebase/compat";

/** Firestore collection for dining dollar exchange posts */
export const DINING_DOLLARS_POSTS_COLLECTION = "DiningDollarsPosts";

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

function computeAmountParts({ amountType, postAmount, postMaxAmount }) {
  const lower = roundMoney(postAmount);
  const upper = roundMoney(postMaxAmount);

  let amountMin;
  let amountMax;
  let amountTitle;

  switch (amountType) {
    case "exact":
      amountMin = lower;
      amountMax = lower;
      amountTitle = `$${lower}`;
      break;
    case "upto":
      amountMin = 0;
      amountMax = lower;
      amountTitle = `Up to $${lower}`;
      break;
    case "more":
      amountMin = lower;
      amountMax = lower;
      amountTitle = `$${lower} or more`;
      break;
    case "range":
      amountMin = lower;
      amountMax = upper;
      amountTitle = `$${lower}-$${upper}`;
      break;
    default:
      amountMin = lower;
      amountMax = lower;
      amountTitle = `$${lower}`;
  }

  return { amountMin, amountMax, amountTitle };
}

/**
 * Infer pricing option for older documents that lack `amountType`.
 */
export function inferAmountTypeFromPost(data) {
  const stored = data?.amountType;
  if (stored && ["exact", "upto", "more", "range"].includes(stored)) return stored;
  const t = data?.amountTitle || "";
  if (t.startsWith("Up to")) return "upto";
  if (t.includes(" or more")) return "more";
  const min = Number(data?.amountMin);
  const max = Number(data?.amountMax);
  if (!Number.isNaN(min) && !Number.isNaN(max) && min !== max && min > 0) return "range";
  if (min === 0 && max > 0) return "upto";
  return "exact";
}

/**
 * Maps a Firestore post into local state for DollarsManagePost.
 */
export function dollarsPostToManageFormState(data) {
  const amountType = inferAmountTypeFromPost(data);
  const startsAt = typeof data?.startsAt?.toDate === "function" ? data.startsAt.toDate() : new Date();
  const expiresAt = typeof data?.expiresAt?.toDate === "function" ? data.expiresAt.toDate() : new Date();
  const min = data?.amountMin;
  const max = data?.amountMax;

  let offerAmount = "";
  let offerMaxAmount = "50";
  if (amountType === "upto") {
    offerAmount = max != null && max !== "" ? String(max) : "";
  } else if (amountType === "range") {
    offerAmount = min != null && min !== "" ? String(min) : "";
    offerMaxAmount = max != null && max !== "" ? String(max) : "";
  } else {
    offerAmount = min != null && min !== "" ? String(min) : "";
  }

  return {
    postType: data?.postType === "request" ? "request" : "offer",
    offerStartDate: startsAt,
    offerEndDate: expiresAt,
    amountType,
    offerAmount,
    offerMaxAmount,
    selectedPayments: Array.isArray(data?.paymentMethods) ? [...data.paymentMethods] : [],
    selectedLocations: Array.isArray(data?.preferredLocations) ? [...data.preferredLocations] : [],
  };
}

/**
 * Partial fields for Firestore update (does not touch createdAt, owner, status, responders).
 */
export function buildDollarsPostUpdatePayload({
  amountType,
  postAmount,
  postMaxAmount,
  postStartDate,
  postEndDate,
  selectedPayments,
  selectedLocations,
}) {
  const { amountMin, amountMax, amountTitle } = computeAmountParts({
    amountType,
    postAmount,
    postMaxAmount,
  });
  return {
    amountType,
    amountMin,
    amountMax,
    amountTitle,
    startsAt: firebase.firestore.Timestamp.fromDate(postStartDate),
    expiresAt: firebase.firestore.Timestamp.fromDate(postEndDate),
    paymentMethods: [...selectedPayments],
    preferredLocations: [...selectedLocations],
  };
}

/**
 * Builds a document matching the DiningDollarsPosts schema for a new offer/request.
 */
export function buildDollarsPostDocument({
  postType,
  amountType,
  postAmount,
  postMaxAmount,
  postStartDate,
  postEndDate,
  selectedPayments,
  selectedLocations,
  ownerID,
  ownerDisplayName,
  ownerPhotoUrl,
}) {
  const { amountMin, amountMax, amountTitle } = computeAmountParts({
    amountType,
    postAmount,
    postMaxAmount,
  });

  return {
    postType,
    amountType,
    amountMin,
    amountMax,
    amountTitle,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    currency: "USD",
    expiresAt: firebase.firestore.Timestamp.fromDate(postEndDate),
    groupID: "",
    ownerDisplayName: ownerDisplayName || "",
    ownerID,
    ownerPhotoUrl: ownerPhotoUrl || "",
    paymentMethods: [...selectedPayments],
    preferredLocations: [...selectedLocations],
    responderDisplayName: "",
    responderID: "",
    responderPhotoUrl: "",
    startsAt: firebase.firestore.Timestamp.fromDate(postStartDate),
    status: "active",
  };
}
