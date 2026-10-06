// How many notifications are waiting, for the Explore bell's badge.
//
// Deliberately NOT derived from `Users/{uid}.hasNotif`: the backend only ever
// sets that flag for event invites and recommendations (checkConnections, for
// one, doesn't), and the old notifications screen cleared it on open, so the
// bell has never been a reliable signal. Counting the same live records the
// notifications feed reads means the badge matches what the screen shows.
//
// Lighter than useNotificationFeed on purpose — just counts, with none of the
// per-row profile and event lookups, since that's all a badge needs.

import { useEffect, useMemo, useState } from "react";
import { db } from "../../provider/Firebase";

export default function useNotificationCount(user, { enabled = true } = {}) {
  // Raw counts are kept exactly as each listener reports them, and the
  // settings gate is applied once at the end — applying it inside the
  // listeners instead would let whichever snapshot fired last win.
  const [connectionCount, setConnectionCount] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [pendingChatCount, setPendingChatCount] = useState(0);
  const [storedNotifications, setStoredNotifications] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!enabled || !user) return;

    const unsubscribeUser = db
      .collection("Users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        const data = doc.data() || {};
        setPendingChatCount((data.pendingRequestGroupIDs || []).length);
        setStoredNotifications(data.notifications || []);
        setSettings(data.settings || {});
      });

    const unsubscribeConnections = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Connections")
      .onSnapshot((query) => setConnectionCount(query.size));

    const unsubscribeInvites = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Invites")
      .onSnapshot((query) => setInviteCount(query.size));

    return () => {
      unsubscribeUser();
      unsubscribeConnections();
      unsubscribeInvites();
    };
  }, [enabled, user?.uid]);

  return useMemo(() => {
    const preferences = settings?.notifications || {};
    const wantsEvents = preferences.events ?? true;
    const wantsRecommendations = settings?.getRecommendations ?? true;

    // Only the stored types the feed actually renders: event updates and
    // recommendations. Invite entries are counted from the live invite docs
    // instead (so they aren't double-counted), and the connection entries the
    // backend writes aren't shown as their own rows at all.
    const storedCount = storedNotifications.filter((notif) => {
      if (notif.type === "recommendation") return wantsRecommendations;
      if (notif.type === "private event" || notif.type === "public event") return wantsEvents;
      return false;
    }).length;

    return (
      ((preferences.friendRequests ?? true) ? connectionCount : 0) +
      (wantsEvents ? inviteCount : 0) +
      ((preferences.chatMessages ?? true) ? pendingChatCount : 0) +
      storedCount
    );
  }, [settings, storedNotifications, connectionCount, inviteCount, pendingChatCount]);
}
