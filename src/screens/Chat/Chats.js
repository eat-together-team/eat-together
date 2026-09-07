//Chat with users you have already connected with

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import ChatPreview from "../../components/ChatPreview";
import ChatPreviewSkeleton from "../../components/ChatPreviewSkeleton";
import Searchbar from "../../components/Searchbar";
import LargeAppBar from "../../components/LargeAppBar";
import Header3Text from "../../components/typography/Header3Text";
import useChatGroups from "./useChatGroups";
import useDeferredReady from "../../utils/useDeferredReady";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";
import moment from "moment";

// Figma export (chatbubbles.svg) — stroke color is passed in rather than
// baked in as the exported #BBBBBB so it can adapt to light/dark theme.
const EmptyChatsIcon = ({ size = 59, color }) => (
  <Svg width={size} height={size} viewBox="0 0 59 59" fill="none">
    <Path
      d="M49.6642 36.9429C49.5489 36.5281 49.8024 35.9519 50.0444 35.5371C50.1184 35.4136 50.1992 35.2943 50.2864 35.1798C52.3563 32.1041 53.4635 28.4816 53.4669 24.7742C53.5015 14.1496 44.5362 5.53003 33.4507 5.53003C23.7825 5.53003 15.7161 12.1099 13.8263 20.8447C13.5435 22.1393 13.4006 23.4606 13.3999 24.7857C13.3999 35.4218 22.0194 44.2718 33.105 44.2718C34.8681 44.2718 37.2419 43.7418 38.544 43.3845C39.8462 43.0273 41.1368 42.5548 41.471 42.4281C41.8136 42.2989 42.1766 42.2326 42.5427 42.2322C42.9421 42.2307 43.3378 42.309 43.7065 42.4627L50.2403 44.7789C50.3836 44.8395 50.535 44.8783 50.6898 44.8941C50.9342 44.8941 51.1687 44.797 51.3416 44.6241C51.5145 44.4512 51.6116 44.2167 51.6116 43.9722C51.6036 43.8668 51.5843 43.7624 51.554 43.6611L49.6642 36.9429Z"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M7.6561 26.733C6.14473 29.4482 5.4136 32.5284 5.54355 35.6332C5.6735 38.738 6.65947 41.7464 8.39245 44.3258C8.65864 44.728 8.80845 45.0391 8.76235 45.2477C8.71626 45.4562 7.38761 52.3772 7.38761 52.3772C7.35565 52.5392 7.36777 52.7068 7.42271 52.8624C7.47764 53.0181 7.57337 53.1562 7.69989 53.2622C7.86872 53.3967 8.07865 53.4692 8.2945 53.4673C8.40985 53.4677 8.52402 53.4441 8.62984 53.3982L15.1072 50.863C15.553 50.6873 16.0503 50.6956 16.49 50.8861C18.6725 51.7365 21.0855 52.2689 23.4997 52.2689C26.7392 52.2723 29.9219 51.4179 32.7242 49.7925"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </Svg>
);

export const createNewChat = (
  userIDs,
  chatID,
  chatName,
  toIncludeOnChatPage
) => {
  // Create a new doc in the groups collection on firestore with input
  db.collection("Groups").doc(chatID).set({
    uids: userIDs,
    name: chatName,
    messages: []
  });
  // If we want to display this chat on the chat page, update each user's data to include this chat
  if (toIncludeOnChatPage) {
    userIDs.map((uid) => {
      db.collection("Users")
        .doc(uid)
        .update({
          groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
        });
    });
  }
};

// Deletes a chat from the current user's perspective. A 1-on-1 chat is
// removed outright — once you're gone there's no other stakeholder left to
// keep it around for, same as the cleanup already done when blocking a user
// (see databaseStoreBlockAction in FullProfile.js). A group chat just drops
// the current user from it, leaving everyone else's copy intact. Without
// this distinction, "deleting" a 1-on-1 chat only unlinked it from your own
// groupIDs — the Groups doc (and all its messages) stuck around forever, so
// starting a "new" chat with that same person just reopened the old thread
// instead of actually starting fresh.
//
// Also doubles as "withdraw"/"decline" for a still-pending message request —
// both are just "delete this 1-on-1 chat" from whichever side calls it, and
// clearing pendingRequestGroupIDs here (a harmless no-op if it was never
// pending) means neither side needs its own separate delete path.
export const deleteChat = (user, group) => {
  const cleanup =
    group.uids.length === 2
      ? db
          .collection("Groups")
          .doc(group.groupID)
          .delete()
          .then(() => {
            const otherUid = group.uids.find((uid) => uid !== user.uid);
            if (!otherUid) return;
            return db
              .collection("Users")
              .doc(otherUid)
              .update({
                groupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
                archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
                pendingRequestGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
              });
          })
      : db
          .collection("Groups")
          .doc(group.groupID)
          .update({
            uids: firebase.firestore.FieldValue.arrayRemove(user.uid),
          });

  return Promise.all([
    cleanup,
    db
      .collection("Users")
      .doc(user.uid)
      .update({
        groupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
        archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
        pendingRequestGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
      }),
  ]);
};

// Creates a message request: a normal 1-on-1 Groups doc, but flagged pending
// so the recipient doesn't see it as a real chat until they accept it. The
// sender's own groupIDs gets it right away (it's their chat too, they just
// get a one-message-then-wait composer — see ChatRoom.js), while the
// recipient only gets it added to pendingRequestGroupIDs, which is what
// keeps it out of their normal inbox (useChatGroups.js never reads that
// field) until accept moves it over to their real groupIDs.
export const createMessageRequest = (user, userData, person, chatID) => {
  const chatName = [person.name, userData.firstName + " " + userData.lastName].join(", ");

  return Promise.all([
    db.collection("Groups").doc(chatID).set({
      uids: [person.id, user.uid],
      name: chatName,
      messages: [],
      pending: true,
      requestedBy: user.uid,
    }),
    db.collection("Users").doc(user.uid).update({
      groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
    }),
    db.collection("Users").doc(person.id).update({
      pendingRequestGroupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
    }),
  ]);
};

// Accepting turns a pending request into a normal chat: the Groups doc's
// pending flag clears (both sides' live ChatRoom listeners pick this up
// immediately) and the accepting user's own groupIDs gets the id so it now
// shows in their real inbox too.
export const acceptMessageRequest = (user, group) => {
  return Promise.all([
    db.collection("Groups").doc(group.groupID).update({
      pending: false,
      requestedBy: firebase.firestore.FieldValue.delete(),
    }),
    db.collection("Users").doc(user.uid).update({
      groupIDs: firebase.firestore.FieldValue.arrayUnion(group.groupID),
      pendingRequestGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
    }),
  ]);
};

// An entry in the chat timeline that isn't a message someone sent — a
// member added/left, the icon changed, a rename. Stored in the same
// `messages` array chat bubbles live in (distinguished by `type: "system"`,
// which a real message never has) so it interleaves in the existing
// chronological list with no changes to how that list is fetched or
// ordered — see SystemMessage.js for how it renders.
export const addSystemMessage = (groupID, text) =>
  db
    .collection("Groups")
    .doc(groupID)
    .update({
      messages: firebase.firestore.FieldValue.arrayUnion({
        type: "system",
        text,
        sentAt: moment().unix(),
      }),
    });

// Lazily creates an event's group chat, the first time anyone taps "Event
// chat" on an event that doesn't have one running yet (see FullCard.js) —
// every current attendee is added at once, not just whoever tapped, and a
// single "X started the event chat" announcement covers the group as it
// stands at that moment. Uses `event.chatID`, a deterministic id already
// stored on the event doc at creation time, as the Groups doc's id.
export const startEventChat = async (event, user) => {
  const userDoc = await db.collection("Users").doc(user.uid).get();
  const firstName = userDoc.data()?.firstName || "Someone";

  await db.collection("Groups").doc(event.chatID).set({
    uids: event.attendees,
    name: event.name,
    messages: [],
    // Lets GroupSettings.js show the event's details and the inbox show an
    // "Event" chip on this chat's preview, without a reverse lookup against
    // both event collections — `type` isn't always set on older event docs,
    // hence the null fallback (Firestore rejects `undefined` outright).
    eventID: event.id,
    eventType: event.type ?? null,
  });

  await Promise.all(
    event.attendees.map((uid) =>
      db.collection("Users").doc(uid).update({
        groupIDs: firebase.firestore.FieldValue.arrayUnion(event.chatID),
      })
    )
  );

  await addSystemMessage(event.chatID, `${firstName} started the event chat`);
};

// Adds a newly-attending person to an event's chat and announces it — but
// only if the chat has actually been started already (attending an event
// never starts its chat on its own; only the first "Event chat" tap does,
// via startEventChat above).
export const addAttendeeToEventChat = async (chatID, uid) => {
  if (!chatID) return;
  const groupDoc = await db.collection("Groups").doc(chatID).get();
  if (!groupDoc.exists) return;

  const userDoc = await db.collection("Users").doc(uid).get();
  const firstName = userDoc.data()?.firstName || "Someone";

  await db.collection("Groups").doc(chatID).update({
    uids: firebase.firestore.FieldValue.arrayUnion(uid),
  });
  await db.collection("Users").doc(uid).update({
    groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
  });
  await addSystemMessage(chatID, `${firstName} joined the event`);
};

// Silently drops someone from an event's chat when they stop attending — no
// announcement, mirroring how withdrawing works everywhere else in the app.
export const removeAttendeeFromEventChat = async (chatID, uid) => {
  if (!chatID) return;
  const groupDoc = await db.collection("Groups").doc(chatID).get();
  if (!groupDoc.exists) return;

  await db.collection("Groups").doc(chatID).update({
    uids: firebase.firestore.FieldValue.arrayRemove(uid),
  });
  await db.collection("Users").doc(uid).update({
    groupIDs: firebase.firestore.FieldValue.arrayRemove(chatID),
  });
};

// Unlike deleteChat's group branch (which only ever removes the *current*
// user from uids, i.e. "leave"), this actually deletes the Groups doc and
// unlinks every member — a genuinely destructive, irreversible action for
// everyone in the chat, not just the person doing it.
export const deleteGroupForEveryone = (group) => {
  return Promise.all([
    db.collection("Groups").doc(group.groupID).delete(),
    ...group.uids.map((uid) =>
      db
        .collection("Users")
        .doc(uid)
        .update({
          groupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
          archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
          pendingRequestGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
        })
    ),
  ]);
};

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const [messageRequestCount, setMessageRequestCount] = useState(0);
  const [search, setSearch] = useState("");

  // Current user
  const user = firebase.auth().currentUser;

  const ready = useDeferredReady();
  const { groups, setGroups, loading } = useChatGroups(user, { archived: false, enabled: ready });
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      contentOpacity.setValue(0);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  useEffect(() => {
    if (!ready) return;

    db.collection("Users").doc(user.uid).update({
      hasUnreadMessages: false
    });

    // Friend/connection requests (User Invites/.../Connections, surfaced via
    // Requests.js) used to live here — that system stays as-is in the repo,
    // it's just no longer linked from the inbox. This slot is message
    // requests now.
    const unsubscribeMessageRequests = db
      .collection("Users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        setMessageRequestCount((doc.data()?.pendingRequestGroupIDs || []).length);
      });

    return () => unsubscribeMessageRequests();
  }, [ready]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleDeleteChat = (groupID) => {
    const group = groups.find((g) => g.groupID === groupID);
    const previousGroups = groups;
    setGroups((prev) => prev.filter((g) => g.groupID !== groupID));

    // Swiping a group chat only ever removes you from it (see deleteChat's
    // non-1:1 branch) — same as GroupSettings.js's "Leave group", so it gets
    // the same "X left the chat" system message, posted first so this user
    // still has normal member write access at the moment it's added.
    const isGroupChat = group.uids.length > 2;
    const cleanup = isGroupChat
      ? db
          .collection("Users")
          .doc(user.uid)
          .get()
          .then((doc) => addSystemMessage(groupID, `${doc.data()?.firstName} left the chat`))
          .then(() => deleteChat(user, group))
      : deleteChat(user, group);

    cleanup.catch((error) => {
      console.error("Failed to delete chat:", error);
      setGroups(previousGroups);
      alert("Couldn't delete this chat: " + error.message);
    });
  };

  const handleArchiveChat = (groupID) => {
    const previousGroups = groups;
    setGroups((prev) => prev.filter((group) => group.groupID !== groupID));
    db.collection("Users")
      .doc(user.uid)
      .update({
        archivedGroupIDs: firebase.firestore.FieldValue.arrayUnion(groupID),
      })
      .catch((error) => {
        console.error("Failed to archive chat:", error);
        setGroups(previousGroups);
        alert("Couldn't archive this chat: " + error.message);
      });
  };

  return (
    <Layout>
      <LargeAppBar
        title="Inbox"
        actions={[
          { icon: "pencil-outline", onPress: () => navigation.navigate("NewChat") },
          { icon: "archive-outline", onPress: () => navigation.navigate("ArchivedChats") },
        ]}
      />

      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />

      <View style={styles.messagesRow}>
        <Header3Text color={tokens.onBackground}>Messages</Header3Text>
        <TouchableOpacity onPress={() => navigation.navigate("MessageRequests")}>
          <Header3Text color={tokens.primary}>
            {messageRequestCount > 0 ? `Requests (${messageRequestCount})` : "Requests"}
          </Header3Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ?
          <View style={styles.chats}>
            {Array.from({ length: 7 }).map((_, index) => (
              <ChatPreviewSkeleton key={index} />
            ))}
          </View>
        :
          <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
            <FlatList
              contentContainerStyle={[styles.chats, filteredGroups.length === 0 && styles.chatsEmpty]}
              keyExtractor={(item) => item.groupID}
              data={filteredGroups}
              renderItem={({ item }) => (
                <ChatPreview
                  group={item}
                  onPress={() => {
                    navigation.navigate("ChatRoom", {
                      group: item,
                    });
                  }}
                  onDelete={() => handleDeleteChat(item.groupID)}
                  archiveAction={{
                    label: "Archive chat",
                    icon: "archive",
                    onPress: () => handleArchiveChat(item.groupID),
                  }}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <EmptyChatsIcon color={tokens.textLight} />
                  <Header3Text color={tokens.textLight} center>
                    {search.trim() ? "No chats found" : "You don't have any\nactive chats"}
                  </Header3Text>
                </View>
              }
            />
          </Animated.View>
        }
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  messagesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1
  },
  chats: {
    paddingHorizontal: 20,
  },
  chatsEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
