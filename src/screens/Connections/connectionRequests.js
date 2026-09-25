// Accept/decline for a connection ("taste bud") request — the writes that
// used to live inline in MessageList.js's JSX, pulled out so the Requests
// screen and the Notifications feed act on a request the exact same way.
//
// A request lives at User Invites/{recipientUid}/Connections/{senderUid}:
// the DOC ID IS THE SENDER'S UID. The original inline version instead looked
// the sender up by `Usernames/{username}` and aborted with "this user seems
// to no longer exist" whenever that lookup missed (a renamed or missing
// username doc) — even though the id it needed was already in hand. These
// use the doc id directly.

import firebase from "firebase/compat";
import { db } from "../../provider/Firebase";

/**
 * Accepts a connection request: befriends both users, then clears the request.
 * @param {Object} user The current (recipient) user, i.e. auth.currentUser.
 * @param {string} senderId UID of the person who sent the request.
 * @returns {Promise<void>}
 */
export const acceptConnectionRequest = async (user, senderId) => {
  await Promise.all([
    db.collection("Users").doc(user.uid).update({
      friendIDs: firebase.firestore.FieldValue.arrayUnion(senderId),
    }),
    db.collection("Users").doc(senderId).update({
      friendIDs: firebase.firestore.FieldValue.arrayUnion(user.uid),
    }),
  ]);

  // Only after both sides are friends — deleting first would drop the request
  // with nothing to show for it if a friendIDs write then failed.
  await db
    .collection("User Invites")
    .doc(user.uid)
    .collection("Connections")
    .doc(senderId)
    .delete();
};

/**
 * Declines a connection request by removing it. Nothing is written to the
 * sender, so they aren't told — same behavior as the original inline version.
 * @param {Object} user The current (recipient) user, i.e. auth.currentUser.
 * @param {string} senderId UID of the person who sent the request.
 * @returns {Promise<void>}
 */
export const declineConnectionRequest = (user, senderId) =>
  db
    .collection("User Invites")
    .doc(user.uid)
    .collection("Connections")
    .doc(senderId)
    .delete();
