import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/compat";
import { auth, db } from "../../../provider/Firebase";
import { DOLLARS_LOCATIONS, dollarsPaymentMethodToBadge } from "./dollarsConstants";
import DollarsPostCard from "./DollarsPostCard";

const DINING_DOLLARS_POSTS_COLLECTION = "DiningDollarsPosts";

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

export default function DollarsActivePosts({ navigation }) {
  const [posts, setPosts] = useState([]);

  const uid = auth?.currentUser?.uid || firebase.auth().currentUser?.uid;

  useEffect(() => {
    if (!uid) return undefined;

    let q = db
      .collection(DINING_DOLLARS_POSTS_COLLECTION)
      .where("ownerID", "==", uid)
      .where("status", "==", "active");
    q = q.orderBy("createdAt", "desc");

    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        const next = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(next);
      },
      () => {
        // If ordering/indexing fails, fall back to filtering only.
        db.collection(DINING_DOLLARS_POSTS_COLLECTION)
          .where("ownerID", "==", uid)
          .where("status", "==", "active")
          .get()
          .then((snapshot) => {
            const next = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts(next);
          })
          .catch(() => {});
      }
    );

    return unsubscribe;
  }, [uid]);

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

      <View style={styles.content}>
        {viewModels.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active posts</Text>
            <Text style={styles.emptyBody}>Create a new post to get started!</Text>
          </View>
        ) : (
          viewModels.map((post) => (
            <DollarsPostCard
              key={post.id}
              post={post}
              buttonLabel="Manage"
              onPressButton={() => navigation.navigate("DollarsManagePost")}
              wrapLocations
            />
          ))
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: "#fff",
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
    fontSize: 18,
    color: "#111",
    fontWeight: "600",
  },
  topBarSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 24,
    paddingTop: 170,
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
