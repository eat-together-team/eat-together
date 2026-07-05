//Shared chat-list data fetching for Chats.js (inbox) and ArchivedChats.js —
//same Firestore enrichment logic, just filtered to archived vs non-archived
//groupIDs (Users/{uid}.archivedGroupIDs is a subset of Users/{uid}.groupIDs).

import { useEffect, useState } from "react";
import { db } from "../../provider/Firebase";

export default function useChatGroups(user, { archived = false, enabled = true } = {}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Deferring this until `enabled` (e.g. until the screen's nav transition
    // has finished) keeps the fetch + list-render work from competing with
    // the transition's own JS-thread work, which is what was making the
    // animation itself look janky.
    if (!enabled) return;

    const unsubscribe = db
      .collection("Users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (!doc.exists) return;

        const nameCurrent = doc.data().firstName + " " + doc.data().lastName;
        const allGroupIDs = doc.data().groupIDs || [];
        const archivedGroupIDs = doc.data().archivedGroupIDs || [];
        const groupIDs = archived
          ? allGroupIDs.filter((id) => archivedGroupIDs.includes(id))
          : allGroupIDs.filter((id) => !archivedGroupIDs.includes(id));

        let temp = [];
        let remaining = groupIDs.length;

        if (remaining === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }

        groupIDs.forEach((groupID) => {
          db.collection("Groups")
            .doc(groupID)
            .get()
            .then((doc) => {
              let data = doc.data();

              let message = "";
              let unread = false;

              if (data.messages.length > 0) {
                const lastMessage = data.messages[data.messages.length - 1];
                message = lastMessage.message || (lastMessage.url ? "Image" : "");
                if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
                  unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
                }
              }

              let time =
                data.messages.length != 0
                  ? data.messages[data.messages.length - 1].sentAt
                  : "";

              // Get rid of your own name and all the ways it can be formatted in group title (if it is a DM)
              let name = data.name;
              if (data.uids.length >= 2) {
                name = name.replace(nameCurrent + ", ", "");
                if (name.endsWith(", " + nameCurrent)) {
                  name = name.slice(0, -1 * (nameCurrent.length + 2));
                }
              }

              // For a 1-on-1 chat, use the other person's own profile photo
              // (same lookup ChatRoom.js uses) instead of a group photo, since
              // group docs are never actually given one.
              const otherUids = data.uids.filter((uid) => uid !== user.uid);
              const avatarLookup =
                otherUids.length === 1
                  ? db
                      .collection("Users")
                      .doc(otherUids[0])
                      .get()
                      .then((userDoc) => {
                        const userData = userDoc.data();
                        return userData && userData.hasImage
                          ? userData.image
                          : null;
                      })
                  : Promise.resolve(null);

              return avatarLookup.then((avatarUri) => {
                temp.push({
                  groupID: groupID,
                  name: name,
                  uids: data.uids,
                  hasImage: data.hasImage,
                  message: message,
                  unread: unread,
                  time: time,
                  pictureID: data.id,
                  avatarUri: avatarUri,
                });
              });
            })
            .then(() => {
              remaining--;
              if (remaining === 0) {
                temp.sort((a, b) => b.time - a.time);
                setGroups(temp);
                setLoading(false);
              }
            });
        });
      });

    return () => unsubscribe();
  }, [user.uid, archived, enabled]);

  return { groups, setGroups, loading };
}
