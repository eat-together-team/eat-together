import firebase from "firebase/compat";

/** Firestore collection for dining dollar exchange posts */
export const DINING_DOLLARS_POSTS_COLLECTION = "DiningDollarsPosts";

/** `Users/{uid}` field incremented when creating an active post (see DollarsExchange badge). */
export const USER_DINING_DOLLARS_POST_COUNT_FIELD = "diningDollarsPostCount";

/** Post lifecycle: active -> matched (poster accepted a claim) -> completed | cancelled. */
export const POST_STATUS = {
  ACTIVE: "active",
  MATCHED: "matched",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/** Amount types offered by the create/edit dropdown. "range" is read-only, for legacy posts. */
export const AMOUNT_TYPE_OPTIONS = [
  { value: "upto", label: "Up to" },
  { value: "exact", label: "Exactly" },
  { value: "more", label: "Or more" },
];

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
 * Maps a Firestore post into local form state for the Edit offer / Edit request screen.
 */
export function dollarsPostToManageFormState(data) {
  const amountType = inferAmountTypeFromPost(data);
  const startsAt = typeof data?.startsAt?.toDate === "function" ? data.startsAt.toDate() : new Date();
  const expiresAt = typeof data?.expiresAt?.toDate === "function" ? data.expiresAt.toDate() : new Date();
  const min = data?.amountMin;
  const max = data?.amountMax;

  let postAmount = "";
  let postMaxAmount = "50";
  if (amountType === "upto") {
    postAmount = max != null && max !== "" ? String(max) : "";
  } else if (amountType === "range") {
    postAmount = min != null && min !== "" ? String(min) : "";
    postMaxAmount = max != null && max !== "" ? String(max) : "";
  } else {
    postAmount = min != null && min !== "" ? String(min) : "";
  }

  return {
    postType: data?.postType === "request" ? "request" : "offer",
    postStartDate: startsAt,
    postEndDate: expiresAt,
    amountType,
    postAmount,
    postMaxAmount,
    selectedPayments: Array.isArray(data?.paymentMethods) ? [...data.paymentMethods] : [],
    selectedLocations: Array.isArray(data?.preferredLocations) ? [...data.preferredLocations] : [],
  };
}

/**
 * Partial fields for Firestore update (does not touch createdAt, owner, status, claims).
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
    startsAt: firebase.firestore.Timestamp.fromDate(postStartDate || new Date()),
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
    startsAt: firebase.firestore.Timestamp.fromDate(postStartDate || new Date()),
    status: POST_STATUS.ACTIVE,
    // Claims live in the `Claims` subcollection; these mirror them so feeds can query by user.
    claimantIDs: [],
    acceptedClaimantID: "",
  };
}

export const toDate = (value) =>
  typeof value?.toDate === "function" ? value.toDate() : value instanceof Date ? value : null;

/** A post is expired once its `expiresAt` day has passed. */
export function isDollarsPostExpired(data, now = new Date()) {
  const expiresAt = toDate(data?.expiresAt);
  if (!expiresAt) return false;
  const endOfDay = new Date(expiresAt);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay < now;
}

/** "5/17" */
export function formatAvailableUntil(data) {
  const expiresAt = toDate(data?.expiresAt);
  return expiresAt ? `${expiresAt.getMonth() + 1}/${expiresAt.getDate()}` : "";
}

/** "Offering up to $75" / "Requesting $25" */
export function dollarsPostHeadline(data) {
  const verb = data?.postType === "request" ? "Requesting" : "Offering";
  const title = data?.amountTitle || "";
  const lowered = title.startsWith("Up to") ? `up to${title.slice(5)}` : title;
  return `${verb} ${lowered}`.trim();
}

/** Required-field check used by the create/edit forms' invalid banner. */
export function isDollarsPostFormComplete({ amountType, postAmount, postEndDate, selectedPayments, selectedLocations }) {
  const amount = Number(postAmount);
  return (
    !!amountType &&
    postAmount !== "" &&
    !Number.isNaN(amount) &&
    amount > 0 &&
    postEndDate instanceof Date &&
    selectedPayments?.length > 0 &&
    selectedLocations?.length > 0
  );
}

/**
 * Creates a new DiningDollarsPosts document and increments {@link USER_DINING_DOLLARS_POST_COUNT_FIELD}
 * on `Users/{ownerUid}` in a single batch (post is not written if the user update fails).
 *
 * @param {firebase.firestore.Firestore} db
 * @param {object} postDoc from {@link buildDollarsPostDocument}
 * @param {string} ownerUid
 * @returns {Promise<string>} New post document id
 */
export async function commitNewDiningDollarsPost(db, postDoc, ownerUid) {
  if (!ownerUid) {
    throw new Error("commitNewDiningDollarsPost: ownerUid is required");
  }
  const batch = db.batch();
  const postRef = db.collection(DINING_DOLLARS_POSTS_COLLECTION).doc();
  batch.set(postRef, postDoc);
  batch.set(
    db.collection("Users").doc(ownerUid),
    { [USER_DINING_DOLLARS_POST_COUNT_FIELD]: firebase.firestore.FieldValue.increment(1) },
    { merge: true }
  );
  await batch.commit();
  return postRef.id;
}
