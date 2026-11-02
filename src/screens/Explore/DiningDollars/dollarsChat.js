import firebase from "firebase/compat";

import { db } from "../../../provider/Firebase";
import { createNewChat } from "../../Chat/Chats";

/**
 * Opens the 1-on-1 chat between the current user and the other side of a ready exchange
 * ("Chat with <name> to claim|fulfill"). Uses the same deterministic chat ID as NewChat.js
 * (sorted usernames), so an existing thread between the two is reopened instead of
 * duplicated. Once a claim is accepted both sides have agreed to talk, so this skips
 * message-request gating and creates a normal chat.
 */
export async function openDollarsExchangeChat(navigation, currentUid, otherUid) {
  const [meDoc, otherDoc] = await Promise.all([
    db.collection("Users").doc(currentUid).get(),
    db.collection("Users").doc(otherUid).get(),
  ]);
  const me = meDoc.data();
  const other = otherDoc.data();
  if (!me || !other) throw new Error("Couldn't find this user.");

  const myName = `${me.firstName} ${me.lastName}`;
  const otherName = `${other.firstName} ${other.lastName}`;
  const chatID = [me.username, other.username].sort().join();
  const uids = [otherUid, currentUid];

  const existing = await db.collection("Groups").doc(chatID).get();
  if (existing.exists) {
    const data = existing.data();
    // Re-link into both inboxes in case either side deleted/archived it.
    await Promise.all(
      uids.map((uid) =>
        db.collection("Users").doc(uid).update({
          groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
          archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(chatID),
        })
      )
    );
    navigation.navigate("ChatRoom", {
      group: {
        groupID: chatID,
        uids: data.uids,
        name: otherName,
        messages: data.messages || [],
        pending: data.pending || false,
        requestedBy: data.requestedBy || null,
      },
    });
    return;
  }

  createNewChat(uids, chatID, `${otherName}, ${myName}`, true);
  navigation.navigate("ChatRoom", {
    group: { groupID: chatID, uids, name: otherName, messages: [] },
  });
}
