// Gathers every kind of notification into the categorised sections the
// notifications screen renders, and owns the accept/dismiss writes.
//
// Where each category comes from, and why:
//
//   Friend requests / Event invites / Message requests are read from the LIVE
//   request records (the Connections and Invites subcollections, and the
//   user's pendingRequestGroupIDs) rather than from the stored `notifications`
//   array the backend fans out into. That means a row disappears the moment
//   the thing behind it is handled anywhere in the app, and the list still
//   works when a backend function fails to fire — several of them currently
//   do. The live records also carry the avatar, event photo and date the row
//   needs, which the stored entries (title + body strings only) do not.
//
//   Event updates and Recommendations have no live equivalent — nothing but
//   the backend knows an invite was accepted or an event's time changed — so
//   those come from the stored array, enriched with their event's photo so
//   they look like every other row.
//
//   Exchange requests have no source at all yet (Dining Dollar Exchange isn't
//   built); the adapter returns nothing and the category stays hidden.
//
// Empty categories are dropped here, not in the screen, so the screen just
// maps over whatever it's given.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { db } from "../../provider/Firebase";
import useChatGroups from "../Chat/useChatGroups";
import { acceptMessageRequest, deleteChat } from "../Chat/Chats";
import {
  acceptConnectionRequest,
  declineConnectionRequest,
} from "../Connections/connectionRequests";
import { declineEventInvite, removeStoredNotifications } from "./eventInvites";
import getDate from "../../utils/getDate";

// Event rows always show a photo; this stands in when the event has none of
// its own, same fallback NotificationFull.js uses for the invite header.
const stockEventImage = require("../../../assets/stockEvent.png");

// How long an accepted row keeps showing its green confirmation. The write
// that accepts a request also removes the record behind it, so without this
// hold the listener would pull the row out from under the confirmation before
// anyone could read it.
const CONFIRMATION_MS = 2200;

// Section order. The four from the design come first, in its order, with
// event updates slotted beside the invites they relate to.
export const CATEGORIES = [
  { key: "friendRequests", title: "Friend requests", setting: "friendRequests" },
  { key: "eventInvites", title: "Event invites", setting: "events" },
  { key: "eventUpdates", title: "Event updates", setting: "events" },
  { key: "exchangeRequests", title: "Exchange requests", setting: "diningExchanges" },
  { key: "messageRequests", title: "Message requests", setting: "chatMessages" },
  { key: "recommendations", title: "Recommendations", setting: null },
];

const eventCollectionFor = (type) =>
  type === "public event" ? "Public Events" : "Private Events";

export default function useNotificationFeed(user, { enabled = true } = {}) {
  const [userData, setUserData] = useState(null);
  const [connections, setConnections] = useState(null);
  const [invites, setInvites] = useState(null);
  // notification-id -> { image, hostImage } resolved from the related event.
  const [eventDetails, setEventDetails] = useState({});

  // Rows mid-action: accepted rows held on screen with their confirmation,
  // and dismissed rows hidden optimistically before the write lands.
  const [accepted, setAccepted] = useState({});
  const [dismissed, setDismissed] = useState({});
  const timers = useRef({});

  const { groups: messageGroups, loading: messageGroupsLoading } = useChatGroups(user, {
    pending: true,
    enabled,
  });

  useEffect(
    () => () => Object.values(timers.current).forEach((timer) => clearTimeout(timer)),
    []
  );

  // --- sources -------------------------------------------------------------

  useEffect(() => {
    if (!enabled || !user) return;

    const unsubscribeUser = db
      .collection("Users")
      .doc(user.uid)
      .onSnapshot((doc) => setUserData(doc.exists ? doc.data() : {}));

    const unsubscribeConnections = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Connections")
      .onSnapshot((query) =>
        setConnections(query.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      );

    const unsubscribeInvites = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Invites")
      .onSnapshot((query) =>
        setInvites(query.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      );

    return () => {
      unsubscribeUser();
      unsubscribeConnections();
      unsubscribeInvites();
    };
  }, [enabled, user?.uid]);

  const storedNotifications = useMemo(() => userData?.notifications || [], [userData]);

  // Stored entries are just a title and body, so look up the event each one
  // points at for its photo — that's what lets these rows match the ones built
  // from live records. Cached by notification id; only new ids are fetched.
  useEffect(() => {
    const wanted = storedNotifications.filter(
      (notif) =>
        notif.id &&
        ["private event", "public event", "recommendation"].includes(notif.type)
    );
    const missing = wanted.filter((notif) => !(notif.id in eventDetails));
    if (missing.length === 0) return;

    let cancelled = false;
    Promise.all(
      missing.map((notif) =>
        db
          .collection(eventCollectionFor(notif.type))
          .doc(notif.id)
          .get()
          .then((doc) => {
            const data = doc.data();
            return [
              notif.id,
              data
                ? {
                    image: data.hasImage ? data.image : null,
                    hostImage: data.hasHostImage ? data.hostImage : null,
                  }
                : {},
            ];
          })
          // A deleted event shouldn't stall the row — it just renders without
          // a photo (and several of these outlive their events, since the
          // backend's cleanup of read notifications is currently broken).
          .catch(() => [notif.id, {}])
      )
    ).then((entries) => {
      if (cancelled) return;
      setEventDetails((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [storedNotifications, eventDetails]);

  // --- actions -------------------------------------------------------------

  const holdConfirmation = useCallback((item, confirmation) => {
    setAccepted((prev) => ({ ...prev, [item.id]: { ...item, confirmation } }));
    timers.current[item.id] = setTimeout(() => {
      setAccepted((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      delete timers.current[item.id];
    }, CONFIRMATION_MS);
  }, []);

  const releaseConfirmation = useCallback((itemId) => {
    clearTimeout(timers.current[itemId]);
    delete timers.current[itemId];
    setAccepted((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const accept = useCallback(
    (item) => {
      if (!item.accept) return;
      holdConfirmation(item, item.confirmationText);
      item.accept().catch((error) => {
        console.error("Failed to accept notification action:", error);
        releaseConfirmation(item.id);
        Alert.alert("Something went wrong", "Please try again.");
      });
    },
    [holdConfirmation, releaseConfirmation]
  );

  const dismiss = useCallback((item) => {
    if (!item.dismiss) return;
    setDismissed((prev) => ({ ...prev, [item.id]: true }));
    item.dismiss().catch((error) => {
      console.error("Failed to dismiss notification:", error);
      setDismissed((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      Alert.alert("Something went wrong", "Please try again.");
    });
  }, []);

  // --- items ---------------------------------------------------------------

  const items = useMemo(() => {
    const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c.key, []]));
    if (!user) return byCategory;

    (connections || []).forEach((request) => {
      byCategory.friendRequests.push({
        id: `connection:${request.id}`,
        name: request.name || request.username || "Someone",
        body: "Requested to connect",
        timestamp: request.sentAt,
        avatarUri: request.profile || null,
        actionLabel: "Accept",
        confirmationText: `Added ${request.name || request.username} as friend`,
        dismissLabel: "Decline friend request",
        target: { screen: "FullProfile", lookupPerson: request.id },
        accept: () => acceptConnectionRequest(user, request.id),
        dismiss: () => declineConnectionRequest(user, request.id),
      });
    });

    (invites || []).forEach((invite) => {
      const hostName = invite.hostName
        ? invite.hostName
        : `${invite.hostFirstName || ""} ${invite.hostLastName || ""}`.trim();
      const eventDate = invite.startDate || invite.date;
      byCategory.eventInvites.push({
        id: `invite:${invite.id}`,
        name: hostName || "Someone",
        body: eventDate
          ? `Invited you to an event on ${getDate(eventDate.toDate())}`
          : "Invited you to an event",
        timestamp: invite.sentAt,
        avatarUri: invite.hasHostImage ? invite.hostImage : null,
        thumbnail: invite.hasImage ? invite.image : stockEventImage,
        dismissLabel: "Decline invite",
        target: { screen: "NotificationFull", invite },
        dismiss: () => declineEventInvite(user, invite),
      });
    });

    messageGroups.forEach((group) => {
      byCategory.messageRequests.push({
        id: `messageRequest:${group.groupID}`,
        name: group.name,
        body: "Requested to chat",
        timestamp: group.time,
        avatarUri: group.avatarUri || null,
        actionLabel: "Accept",
        confirmationText: `Accepted ${group.name}'s message request`,
        dismissLabel: "Decline message request",
        target: { screen: "ChatRoom", group },
        accept: () => acceptMessageRequest(user, group),
        dismiss: () => deleteChat(user, group),
      });
    });

    storedNotifications.forEach((notif, index) => {
      const details = eventDetails[notif.id] || {};
      // Stored entries carry no id of their own, and the same event can
      // produce several — index keeps them distinct.
      const id = `stored:${notif.type}:${notif.id}:${index}`;
      const base = {
        id,
        name: notif.title,
        body: notif.body,
        // Entries the backend stamped during its one-off backfill carry a
        // guessed time rather than a real one, so those render without an age
        // instead of claiming to have just arrived.
        timestamp: notif.createdAtBackfilled ? null : notif.createdAt,
        avatarUri: details.hostImage || null,
        thumbnail: details.image || stockEventImage,
        dismissLabel: "Remove",
        dismiss: () =>
          removeStoredNotifications(
            user,
            (candidate) =>
              candidate.type === notif.type &&
              candidate.id === notif.id &&
              candidate.title === notif.title &&
              candidate.body === notif.body
          ),
      };

      if (notif.type === "private event" || notif.type === "public event") {
        byCategory.eventUpdates.push({
          ...base,
          target: { screen: "FullCard", eventId: notif.id, eventType: notif.type },
        });
      } else if (notif.type === "recommendation") {
        byCategory.recommendations.push({
          ...base,
          target: { screen: "Recommendation", eventId: notif.id },
        });
      }
    });

    // Tag each item with the category it landed in, so a held (accepted) copy
    // can still be placed once its live source row is gone.
    Object.entries(byCategory).forEach(([key, list]) => {
      list.forEach((item) => {
        item.category = key;
      });
    });

    return byCategory;
  }, [user, connections, invites, messageGroups, storedNotifications, eventDetails]);

  // --- sections ------------------------------------------------------------

  const sections = useMemo(() => {
    const preferences = userData?.settings?.notifications || {};
    const wantsRecommendations = userData?.settings?.getRecommendations ?? true;

    return CATEGORIES.map((category) => {
      const enabledInSettings =
        category.key === "recommendations"
          ? wantsRecommendations
          : category.setting === null || (preferences[category.setting] ?? true);
      if (!enabledInSettings) return null;

      const live = items[category.key]
        .filter((item) => !dismissed[item.id])
        // An accepted row keeps rendering from the held copy below, so drop
        // the live one to avoid showing it twice during the hold.
        .filter((item) => !accepted[item.id]);

      const held = Object.values(accepted).filter(
        (item) => item.category === category.key
      );

      const data = [...held, ...live];
      return data.length > 0 ? { ...category, data } : null;
    }).filter(Boolean);
  }, [items, userData, dismissed, accepted]);

  // Loading until every source has reported once. The stored-array sources
  // ride along with the user doc, so there's nothing extra to wait on there.
  const loading =
    !enabled ||
    userData === null ||
    connections === null ||
    invites === null ||
    messageGroupsLoading;

  const totalCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections]
  );

  return { sections, loading, totalCount, accept, dismiss };
}
