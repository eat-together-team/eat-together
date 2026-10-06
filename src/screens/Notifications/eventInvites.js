// Declining an event invite, pulled out of NotificationFull.js's JSX so the
// notifications list can decline a swiped-away invite without opening the
// full invite screen first.
//
// Step order matters and is deliberate: the backend's `checkAcceptance`
// function fires on DELETE of the invite doc and decides whether to tell the
// host "accepted" or "declined" purely by checking whether the invitee is
// still in the event's `attendees` array. So the attendee has to be removed
// BEFORE the invite doc goes away, or the host is told the invite was
// accepted.

import firebase from "firebase/compat";
import { db } from "../../provider/Firebase";

const collectionForType = (type) =>
  type === "public" ? "Public Events" : "Private Events";

/**
 * Drops entries from the user's stored `notifications` array by predicate.
 * Read-filter-write rather than arrayRemove because arrayRemove needs an
 * exact deep match of the stored object, which callers acting on a live
 * invite doc (rather than on a notification) don't have.
 * @param {Object} user The current user, i.e. auth.currentUser.
 * @param {Function} shouldRemove Called per notification; true drops it.
 * @returns {Promise<void>}
 */
export const removeStoredNotifications = async (user, shouldRemove) => {
  const doc = await db.collection("Users").doc(user.uid).get();
  const notifications = doc.data()?.notifications || [];
  const remaining = notifications.filter((notif) => !shouldRemove(notif));

  if (remaining.length === notifications.length) return;

  await db.collection("Users").doc(user.uid).update({ notifications: remaining });
};

/**
 * Accepts an event invite: joins the event, records it as attending, clears
 * the stored notification, then deletes the invite.
 * @param {Object} user The current user, i.e. auth.currentUser.
 * @param {Object} invite The invite doc, including its own `id` and `inviteID`.
 * @returns {Promise<void>}
 */
export const acceptEventInvite = async (user, invite) => {
  const storeID = { type: invite.type === "public" ? "public" : "private", id: invite.inviteID };

  // Attendee first: checkAcceptance reads the event's attendees when the
  // invite doc is deleted below, and that's how the host is told which way
  // this went.
  await db
    .collection(collectionForType(invite.type))
    .doc(invite.inviteID)
    .update({
      attendees: firebase.firestore.FieldValue.arrayUnion(user.uid),
    });

  await db.collection("Users").doc(user.uid).update({
    attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
  });

  await removeStoredNotifications(
    user,
    (notif) => notif.type === "invite" && notif.id === invite.id
  );

  await db
    .collection("User Invites")
    .doc(user.uid)
    .collection("Invites")
    .doc(invite.id)
    .delete();
};

/**
 * Declines an event invite: leaves the event, clears it from the user's
 * attending list and stored notifications, then deletes the invite.
 * @param {Object} user The current user, i.e. auth.currentUser.
 * @param {Object} invite The invite doc, including its own `id` and `inviteID`.
 * @returns {Promise<void>}
 */
export const declineEventInvite = async (user, invite) => {
  const inviteRef = db
    .collection("User Invites")
    .doc(user.uid)
    .collection("Invites")
    .doc(invite.id);

  // `arrayRemove` on a value that isn't there is a no-op, so this is safe for
  // an invite the user never accepted in the first place (the common case
  // when declining straight from the list).
  const storeID = { type: invite.type === "public" ? "public" : "private", id: invite.inviteID };

  await db.collection("Users").doc(user.uid).update({
    attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
  });

  await db
    .collection(collectionForType(invite.type))
    .doc(invite.inviteID)
    .update({
      attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
    });

  // The backend wrote a matching `type: "invite"` entry when the invite was
  // created; drop it so it can't outlive the invite it points at.
  await removeStoredNotifications(
    user,
    (notif) => notif.type === "invite" && notif.id === invite.id
  );

  // Last — this is what tells the host, via checkAcceptance.
  await inviteRef.delete();
};
