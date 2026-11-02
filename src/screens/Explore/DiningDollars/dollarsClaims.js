import firebase from "firebase/compat";

import {
  DINING_DOLLARS_POSTS_COLLECTION,
  USER_DINING_DOLLARS_POST_COUNT_FIELD,
  POST_STATUS,
} from "./dollarsPostSchema";

/**
 * Claim model (pending team sign-off):
 *
 *   DiningDollarsPosts/{postId}/Claims/{claimantID}
 *     claimantID, claimantDisplayName, claimantPhotoUrl, status, createdAt, updatedAt
 *
 * One claim doc per user per post (doc id = claimant uid). The poster accepts exactly one
 * claim; the post mirrors it in `acceptedClaimantID` and moves active -> matched. Every
 * open claimant is mirrored in the post's `claimantIDs` so "My exchanges" can query with
 * `array-contains` instead of a collection-group index.
 */
export const DOLLARS_CLAIMS_SUBCOLLECTION = "Claims";

export const CLAIM_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/** Chip label shown on "My exchanges" cards and detail screens: PENDING (gray) / READY (green). */
export function claimStatusChip(status) {
  if (status === CLAIM_STATUS.PENDING) return "PENDING";
  if (status === CLAIM_STATUS.ACCEPTED) return "READY";
  return null;
}

const postRef = (db, postId) => db.collection(DINING_DOLLARS_POSTS_COLLECTION).doc(postId);
const claimRef = (db, postId, claimantID) =>
  postRef(db, postId).collection(DOLLARS_CLAIMS_SUBCOLLECTION).doc(claimantID);
const now = () => firebase.firestore.FieldValue.serverTimestamp();

/** "Request to claim offer" / "Request to fulfill". */
export async function requestDollarsClaim(db, postId, { uid, displayName, photoUrl }) {
  await db.runTransaction(async (t) => {
    const post = await t.get(postRef(db, postId));
    if (!post.exists) throw new Error("This post no longer exists.");
    const data = post.data();
    if (data.ownerID === uid) throw new Error("You can't claim your own post.");
    if (data.status !== POST_STATUS.ACTIVE) throw new Error("This post is no longer available.");

    t.set(claimRef(db, postId, uid), {
      claimantID: uid,
      claimantDisplayName: displayName || "",
      claimantPhotoUrl: photoUrl || "",
      status: CLAIM_STATUS.PENDING,
      createdAt: now(),
      updatedAt: now(),
    });
    t.update(postRef(db, postId), {
      claimantIDs: firebase.firestore.FieldValue.arrayUnion(uid),
    });
  });
}

/**
 * Claimant withdraws (red X on "Request pending"), or either side cancels a ready exchange
 * ("Cancel exchange"). If the cancelled claim was the accepted one, the post reopens.
 */
export async function cancelDollarsClaim(db, postId, claimantID) {
  await db.runTransaction(async (t) => {
    const post = await t.get(postRef(db, postId));
    const claim = await t.get(claimRef(db, postId, claimantID));
    if (!post.exists || !claim.exists) return;

    t.update(claimRef(db, postId, claimantID), { status: CLAIM_STATUS.CANCELLED, updatedAt: now() });
    const postUpdate = { claimantIDs: firebase.firestore.FieldValue.arrayRemove(claimantID) };
    if (post.data().acceptedClaimantID === claimantID) {
      postUpdate.acceptedClaimantID = "";
      postUpdate.status = POST_STATUS.ACTIVE;
    }
    t.update(postRef(db, postId), postUpdate);
  });
}

/** Poster accepts one pending claim. Other pending claims stay pending in case this one falls through. */
export async function acceptDollarsClaim(db, postId, claimantID) {
  await db.runTransaction(async (t) => {
    const post = await t.get(postRef(db, postId));
    const claim = await t.get(claimRef(db, postId, claimantID));
    if (!post.exists || !claim.exists) throw new Error("This request no longer exists.");
    if (post.data().status !== POST_STATUS.ACTIVE) throw new Error("You already accepted someone for this post.");
    if (claim.data().status !== CLAIM_STATUS.PENDING) throw new Error("This request is no longer pending.");

    t.update(claimRef(db, postId, claimantID), { status: CLAIM_STATUS.ACCEPTED, updatedAt: now() });
    t.update(postRef(db, postId), { status: POST_STATUS.MATCHED, acceptedClaimantID: claimantID });
  });
}

/** "Mark as complete" (either party) closes the post and its accepted claim. */
export async function completeDollarsExchange(db, postId) {
  await db.runTransaction(async (t) => {
    const post = await t.get(postRef(db, postId));
    if (!post.exists) return;
    const { status, acceptedClaimantID } = post.data();
    if (status !== POST_STATUS.MATCHED || !acceptedClaimantID) {
      throw new Error("There's no exchange in progress for this post.");
    }
    t.update(claimRef(db, postId, acceptedClaimantID), { status: CLAIM_STATUS.COMPLETED, updatedAt: now() });
    t.update(postRef(db, postId), { status: POST_STATUS.COMPLETED });
  });
}

/** Claims for one post, newest first; the poster uses this to pick who to accept. */
export function dollarsClaimsQuery(db, postId) {
  return postRef(db, postId).collection(DOLLARS_CLAIMS_SUBCOLLECTION).orderBy("createdAt", "desc");
}

/** Posts the user has an open claim on ("My exchanges"). */
export function myDollarsExchangesQuery(db, uid) {
  return db.collection(DINING_DOLLARS_POSTS_COLLECTION).where("claimantIDs", "array-contains", uid);
}

/**
 * "Delete offer?" / "Delete request": removes the post and its claims, and decrements the
 * owner's post count, in one batch.
 */
export async function deleteDiningDollarsPost(db, postId, ownerUid) {
  const claims = await postRef(db, postId).collection(DOLLARS_CLAIMS_SUBCOLLECTION).get();
  const batch = db.batch();
  claims.forEach((doc) => batch.delete(doc.ref));
  batch.delete(postRef(db, postId));
  batch.set(
    db.collection("Users").doc(ownerUid),
    { [USER_DINING_DOLLARS_POST_COUNT_FIELD]: firebase.firestore.FieldValue.increment(-1) },
    { merge: true }
  );
  await batch.commit();
}
