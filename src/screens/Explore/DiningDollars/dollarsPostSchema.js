import firebase from "firebase/compat";

/** Firestore collection for dining dollar exchange posts */
export const DINING_DOLLARS_POSTS_COLLECTION = "DiningDollarsPosts";

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Builds a document matching the DiningDollarsPosts schema for a new offer.
 */
export function buildOfferPostDocument({
  amountType,
  offerAmount,
  offerMaxAmount,
  offerStartDate,
  offerEndDate,
  selectedPayments,
  selectedLocations,
  ownerID,
  ownerDisplayName,
  ownerPhotoUrl,
}) {
  const lower = roundMoney(offerAmount);
  const upper = roundMoney(offerMaxAmount);

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
    amountMin,
    amountMax,
    amountTitle,
    amountType,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    currency: "USD",
    expiresAt: firebase.firestore.Timestamp.fromDate(offerEndDate),
    groupID: "",
    ownerDisplayName: ownerDisplayName || "",
    ownerID,
    ownerPhotoUrl: ownerPhotoUrl || "",
    paymentMethods: [...selectedPayments],
    postType: "offer",
    preferredLocations: [...selectedLocations],
    responderDisplayName: "",
    responderID: "",
    responderPhotoUrl: "",
    startsAt: firebase.firestore.Timestamp.fromDate(offerStartDate),
    status: "active",
  };
}
