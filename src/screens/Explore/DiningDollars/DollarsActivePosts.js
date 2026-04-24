import React, { useEffect, useMemo, useState } from "react";
import { DeviceEventEmitter, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/compat";
import { auth, db } from "../../../provider/Firebase";
import { DOLLARS_LOCATIONS, dollarsPaymentMethodToBadge } from "./dollarsConstants";
import { DINING_DOLLARS_POSTS_COLLECTION } from "./dollarsPostSchema";
import DollarsPostCard from "./DollarsPostCard";

const formatAge = (dateOrTimestamp) => {
  const date =
    typeof dateOrTimestamp?.toDate === "function" ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `${Math.max(0, diffMinutes)}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
};

const formatShortDate = (dateOrTimestamp) => {
  const date =
    typeof dateOrTimestamp?.toDate === "function" ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
};

const mapPaymentMethodBadges = (methods = []) =>
  methods.map((m) => dollarsPaymentMethodToBadge(m)).filter(Boolean);

function diningDollarsPostCreatedAtMillis(post) {
  const c = post?.createdAt;
  if (c && typeof c.toMillis === "function") return c.toMillis();
  if (c && typeof c.seconds === "number") return c.seconds * 1000;
  return 0;
}

/** Mutates and returns `posts` sorted newest `createdAt` first. */
export function sortDiningDollarsActivePostsByRecency(posts) {
  posts.sort((a, b) => diningDollarsPostCreatedAtMillis(b) - diningDollarsPostCreatedAtMillis(a));
  return posts;
}

function postsFromDiningDollarsQuerySnapshot(snapshot) {
  const next = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return sortDiningDollarsActivePostsByRecency(next);
}

/**
 * Fetches the current user's active dining dollar posts (newest first).
 * Safe to call from other screens after saves or mutations; does not touch React state.
 *
 * @param {string | undefined} uid Firebase Auth uid
 * @returns {Promise<Array<{ id: string }>>}
 */
export async function refreshMyActiveDiningDollarsPosts(uid) {
  if (!uid) return [];
  const snapshot = await db
    .collection(DINING_DOLLARS_POSTS_COLLECTION)
    .where("ownerID", "==", uid)
    .where("status", "==", "active")
    .get();
  return postsFromDiningDollarsQuerySnapshot(snapshot);
}

/**
 * Fetches a single active post by document id, only if it belongs to `uid`.
 * One read instead of listing all posts — handy right after saving in Manage.
 * Returns null if the doc is missing, not owned by uid, or not active (so callers can drop it from UI).
 *
 * @param {string | undefined} uid Firebase Auth uid
 * @param {string | undefined} postId Firestore document id
 * @returns {Promise<{ id: string } | null>}
 */
export async function refreshMyActiveDiningDollarPost(uid, postId) {
  if (!uid || !postId) return null;
  const snap = await db.collection(DINING_DOLLARS_POSTS_COLLECTION).doc(postId).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (data?.ownerID !== uid || data?.status !== "active") return null;
  return { id: snap.id, ...data };
}

/** Use with `DeviceEventEmitter` after mutating a post so this screen can merge one row without a full query. */
export const DINING_DOLLARS_ACTIVE_POST_UPDATED_EVENT = "diningDollarsActivePostUpdated";

export default function DollarsActivePosts({ navigation }) {
  const [posts, setPosts] = useState([]);

  const uid = auth?.currentUser?.uid || firebase.auth().currentUser?.uid;

  useEffect(() => {
    if (!uid) return undefined;

    // Avoid orderBy("createdAt") here: it requires a composite index and can leave the
    // listener in a broken state; sort client-side instead.
    const q = db
      .collection(DINING_DOLLARS_POSTS_COLLECTION)
      .where("ownerID", "==", uid)
      .where("status", "==", "active");

    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        setPosts(postsFromDiningDollarsQuerySnapshot(snapshot));
      },
      () => {
        refreshMyActiveDiningDollarsPosts(uid).then(setPosts).catch(() => {});
      }
    );

    return unsubscribe;
  }, [uid]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(DINING_DOLLARS_ACTIVE_POST_UPDATED_EVENT, (post) => {
      if (!post?.id) return;
      setPosts((prev) => {
        const i = prev.findIndex((p) => p.id === post.id);
        if (i === -1) {
          return sortDiningDollarsActivePostsByRecency([...prev, post]);
        }
        const next = [...prev];
        next[i] = post;
        return next;
      });
    });
    return () => sub.remove();
  }, []);

  const viewModels = useMemo(
    () =>
      posts.map((p) => {
        const amountTitle = p.amountTitle;
        const paymentMethods = mapPaymentMethodBadges(p.paymentMethods);
        const locationText = Array.isArray(p.preferredLocations)
          ? p.preferredLocations
              .map((id) => DOLLARS_LOCATIONS.find((l) => l.id === id)?.label || id)
              .join(", ")
          : "";

        return {
          id: p.id,
          author: p.ownerDisplayName || "You",
          ownerPhotoUrl: p.ownerPhotoUrl,
          type: String(p.postType || "").toUpperCase(),
          age: formatAge(p.createdAt),
          priceText: amountTitle,
          dateText: formatShortDate(p.startsAt) + " - " + formatShortDate(p.expiresAt),
          locationText,
          paymentMethods,
        };
      }),
    [posts]
  );

  return (
    <Layout style={styles.layout}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My active posts</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <FlatList
        style={styles.list}
        data={viewModels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          viewModels.length === 0 ? [styles.postsListContent, styles.postsListContentEmpty] : styles.postsListContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active posts</Text>
            <Text style={styles.emptyBody}>Create a new post to get started!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DollarsPostCard
            post={item}
            buttonLabel="Manage"
            onPressButton={() => navigation.navigate("DollarsManagePost", { postId: item.id })}
            wrapLocations
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: "#FFFFFF",
  },
  list: {
    flex: 1,
  },
  topBar: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 28,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 28 / 1.55,
    color: "#111",
    fontWeight: "600",
  },
  topBarSpacer: {
    width: 28,
  },
  postsListContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  postsListContentEmpty: {
    flexGrow: 1,
  },
  cardSeparator: {
    height: 16,
  },
  emptyState: {
    paddingHorizontal: 8,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FBFBFB",
  },
  emptyTitle: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  emptyBody: {
    marginTop: 6,
    fontSize: 11,
    color: "rgba(0,0,0,0.6)",
  },
});
