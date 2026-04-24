import firebase from "firebase/compat";

/** Firestore collection for dining dollar exchange posts */
export const DINING_DOLLARS_POSTS_COLLECTION = "DiningDollarsPosts";

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

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
      // Single amount field is the maximum cap
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

  return {
    postType,
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