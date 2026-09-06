//Shared chat-list data fetching for Chats.js (inbox), ArchivedChats.js, and
//MessageRequests.js — same Firestore enrichment logic, just sourced from a
//different groupID list: archived vs non-archived groupIDs (Users/{uid}
//.archivedGroupIDs is a subset of Users/{uid}.groupIDs), or, for `pending`,
//Users/{uid}.pendingRequestGroupIDs (a separate field entirely — groupIDs a
//still-pending message request's recipient hasn't accepted into their real
//groupIDs yet).

import { useEffect, useRef, useState } from "react";
import { db } from "../../provider/Firebase";

export default function useChatGroups(user, { archived = false, pending = false, enabled = true } = {}) {
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
        const groupIDs = pending
          ? doc.data().pendingRequestGroupIDs || []
          : archived
          ? allGroupIDs.filter((id) => archivedGroupIDs.includes(id))
          : allGroupIDs.filter((id) => !archivedGroupIDs.includes(id));

        // Tear down listeners for groups no longer in the list (deleted,
        // left, archived/unarchived elsewhere, etc.) — published right away
        // regardless of whether other groups remain, otherwise a removal
        // sits stale in `groups` until some *other* group's snapshot happens
        // to fire and incidentally re-publishes.
        Object.keys(groupUnsubscribes).forEach((groupID) => {
          if (!groupIDs.includes(groupID)) {
            groupUnsubscribes[groupID]();
            delete groupUnsubscribes[groupID];
            delete groupsMapRef.current[groupID];
          }
        });
        publish();

        if (groupIDs.length === 0) {
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
                message =
                  lastMessage.message ||
                  (lastMessage.url ? "Image" : lastMessage.type === "system" ? lastMessage.text : "");
                if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
                  unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
                }
              }

              let time =
                data.messages.length != 0
                  ? data.messages[data.messages.length - 1].sentAt
                  : "";

              // Group chats only: strip your own name out of the stored,
              // comma-joined title. A 1-on-1 chat skips this entirely (see
              // below) rather than relying on it.
              let name = data.name;
              if (data.uids.length > 2) {
                name = name.replace(nameCurrent + ", ", "");
                if (name.endsWith(", " + nameCurrent)) {
                  name = name.slice(0, -1 * (nameCurrent.length + 2));
                }
              }

              // For a 1-on-1 chat, read the other person's name AND photo
              // straight off their own profile doc instead of string-
              // stripping the group's stored `name` field — that field is a
              // plain "A, B" string frozen at chat-creation time, so it
              // silently shows BOTH names if either one's firstName/lastName
              // ever had different whitespace than what's computed here
              // (e.g. a stray double space), and it never reflects a later
              // name change either way. The other user's own doc is always
              // authoritative.
              const otherUids = data.uids.filter((uid) => uid !== user.uid);
              const lookup =
                otherUids.length === 1
                  ? db
                      .collection("Users")
                      .doc(otherUids[0])
                      .get()
                      .then((userDoc) => {
                        const userData = userDoc.data();
                        return {
                          name: userData
                            ? userData.firstName + " " + userData.lastName
                            : name,
                          avatarUri: userData && userData.hasImage ? userData.image : null,
                        };
                      })
                  : Promise.resolve({ name, avatarUri: null });

              lookup.then(({ name: resolvedName, avatarUri }) => {
                groupsMapRef.current[groupID] = {
                  groupID: groupID,
                  name: resolvedName,
                  uids: data.uids,
                  hasImage: data.hasImage,
                  message: message,
                  unread: unread,
                  time: time,
                  pictureID: data.id,
                  avatarUri: avatarUri,
                  eventID: data.eventID || null,
                  eventType: data.eventType || null,
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
  }, [user.uid, archived, pending, enabled]);

  return { groups, setGroups, loading };
}
