//Shared chat-list data fetching for Chats.js (inbox) and ArchivedChats.js —
//same Firestore enrichment logic, just filtered to archived vs non-archived
//groupIDs (Users/{uid}.archivedGroupIDs is a subset of Users/{uid}.groupIDs).

import { useEffect, useRef, useState } from "react";
import { db } from "../../provider/Firebase";

export default function useChatGroups(user, { archived = false, enabled = true } = {}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  // groupID -> enriched group object, kept across re-subscriptions so a
  // single group's update doesn't require re-deriving every other group.
  const groupsMapRef = useRef({});

  useEffect(() => {
    // Deferring this until `enabled` (e.g. until the screen's nav transition
    // has finished) keeps the fetch + list-render work from competing with
    // the transition's own JS-thread work, which is what was making the
    // animation itself look janky.
    if (!enabled) return;

    // groupID -> unsubscribe fn. Each Groups/{groupID} doc is watched live
    // (not just read once) so a new message updates the inbox preview
    // immediately instead of only refreshing whenever the user's own
    // groupIDs array happens to change (chat created/deleted/archived).
    let groupUnsubscribes = {};

    const publish = () => {
      const list = Object.values(groupsMapRef.current);
      list.sort((a, b) => b.time - a.time);
      setGroups(list);
    };

    const userUnsubscribe = db
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

        // Tear down listeners for groups no longer in the list (deleted,
        // archived/unarchived elsewhere, etc.).
        Object.keys(groupUnsubscribes).forEach((groupID) => {
          if (!groupIDs.includes(groupID)) {
            groupUnsubscribes[groupID]();
            delete groupUnsubscribes[groupID];
            delete groupsMapRef.current[groupID];
          }
        });

        if (groupIDs.length === 0) {
          publish();
          setLoading(false);
          return;
        }

        const pendingFirstLoad = new Set(
          groupIDs.filter((groupID) => !groupUnsubscribes[groupID])
        );
        if (pendingFirstLoad.size === 0) {
          setLoading(false);
        }

        groupIDs.forEach((groupID) => {
          if (groupUnsubscribes[groupID]) return; // already has a live listener

          groupUnsubscribes[groupID] = db
            .collection("Groups")
            .doc(groupID)
            .onSnapshot((groupDoc) => {
              const data = groupDoc.data();
              if (!data) return;

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

              avatarLookup.then((avatarUri) => {
                groupsMapRef.current[groupID] = {
                  groupID: groupID,
                  name: name,
                  uids: data.uids,
                  hasImage: data.hasImage,
                  message: message,
                  unread: unread,
                  time: time,
                  pictureID: data.id,
                  avatarUri: avatarUri,
                };
                publish();

                if (pendingFirstLoad.has(groupID)) {
                  pendingFirstLoad.delete(groupID);
                  if (pendingFirstLoad.size === 0) {
                    setLoading(false);
                  }
                }
              });
            });
        });
      });

    return () => {
      userUnsubscribe();
      Object.values(groupUnsubscribes).forEach((unsubscribe) => unsubscribe());
    };
  }, [user.uid, archived, enabled]);

  return { groups, setGroups, loading };
}
