import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Layout } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../provider/Firebase";
import { DOLLARS_LOCATIONS, dollarsPaymentMethodToBadge } from "./dollarsConstants";
import DollarsPostCard from "./DollarsPostCard";
import { DINING_DOLLARS_POSTS_COLLECTION, USER_DINING_DOLLARS_POST_COUNT_FIELD } from "./dollarsPostSchema";
import firebase from "firebase/compat";

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

/** Firestore row `{ id, ...data }` into props for {@link DollarsPostCard}. */
function diningDollarsPostDocToCardModel(p) {
  const amountTitle = p.amountTitle ?? "";
  const paymentMethods = mapPaymentMethodBadges(p.paymentMethods);
  const locationText = Array.isArray(p.preferredLocations)
    ? p.preferredLocations
        .map((id) => DOLLARS_LOCATIONS.find((l) => l.id === id)?.label || id)
        .join(", ")
    : "";

  return {
    id: p.id,
    author: (p.ownerDisplayName && String(p.ownerDisplayName).trim()) || "Member",
    ownerPhotoUrl: p.ownerPhotoUrl,
    type: String(p.postType || "").toUpperCase(),
    age: formatAge(p.createdAt),
    priceText: amountTitle,
    dateText: formatShortDate(p.startsAt) + " - " + formatShortDate(p.expiresAt),
    locationText,
    paymentMethods,
  };
}

export default function DollarsExchange({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostedPopup, setShowPostedPopup] = useState(false);
  const [popupPostType, setPopupPostType] = useState("offer");
  const [diningDollarsPostCount, setDiningDollarsPostCount] = useState(0);
  const [exchangePostDocs, setExchangePostDocs] = useState([]);

  useEffect(() => {
    const q = db.collection(DINING_DOLLARS_POSTS_COLLECTION).where("status", "==", "active");

    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        const next = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExchangePostDocs(next);
      },
      () => {
        db.collection(DINING_DOLLARS_POSTS_COLLECTION)
          .where("status", "==", "active")
          .get()
          .then((snapshot) => {
            setExchangePostDocs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          })
          .catch(() => setExchangePostDocs([]));
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const uid = auth?.currentUser?.uid || firebase.auth().currentUser?.uid;
    if (!uid) {
      setDiningDollarsPostCount(0);
      return undefined;
    }
    let attemptedEnsurePostCountField = false;
    const unsubscribe = db
      .collection("Users")
      .doc(uid)
      .onSnapshot(
        (doc) => {
          if (!doc.exists) {
            setDiningDollarsPostCount(0);
            return;
          }
          const data = doc.data() || {};
          const field = USER_DINING_DOLLARS_POST_COUNT_FIELD;
          const raw = data[field];
          const fieldMissingOrNull = !(field in data) || raw === null;
          if (fieldMissingOrNull) {
            setDiningDollarsPostCount(0);
            if (!attemptedEnsurePostCountField) {
              attemptedEnsurePostCountField = true;
              db.collection("Users")
                .doc(uid)
                .set({ [field]: 0 }, { merge: true })
                .catch(() => {});
            }
            return;
          }
          const n = typeof raw === "number" ? raw : Number(raw);
          setDiningDollarsPostCount(Number.isFinite(n) ? n : 0);
        },
        () => setDiningDollarsPostCount(0)
      );
    return unsubscribe;
  }, [auth?.currentUser?.uid]);

  useEffect(() => {
    const shouldShowPopup =
      route?.params?.showPostedPopup ||
      route?.params?.showOfferPostedPopup ||
      route?.params?.showRequestPostedPopup;

    if (shouldShowPopup) {
      const postType =
        route?.params?.postType ||
        (route?.params?.showRequestPostedPopup ? "request" : "offer");
      setPopupPostType(postType);
      setShowPostedPopup(true);
      navigation.setParams({
        showPostedPopup: false,
        showOfferPostedPopup: false,
        showRequestPostedPopup: false,
        postType: undefined,
      });
    }
  }, [
    navigation,
    route?.params?.showOfferPostedPopup,
    route?.params?.showPostedPopup,
    route?.params?.showRequestPostedPopup,
    route?.params?.postType,
  ]);

  const exchangeCardPosts = useMemo(
    () => exchangePostDocs.map(diningDollarsPostDocToCardModel),
    [exchangePostDocs]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return exchangeCardPosts;
    return exchangeCardPosts.filter((post) => {
      const paymentSearchBlob = (post.paymentMethods || [])
        .map((method) => {
          const normalized = method.toLowerCase();
          if (normalized === "v") return "v venmo";
          if (normalized === "z") return "z zelle";
          if (normalized === "$") return "$ cash";
          if (normalized === "c") return "c cashapp cash app";
          return normalized;
        })
        .join(" ");

      return (
        String(post.priceText || "").toLowerCase().includes(query) ||
        String(post.locationText || "").toLowerCase().includes(query) ||
        String(post.dateText || "").toLowerCase().includes(query) ||
        paymentSearchBlob.includes(query) ||
        String(post.type || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery, exchangeCardPosts]);

  return (
    <Layout style={styles.layout}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MainTabs", {
              screen: "Explore",
              params: { screen: "Explore" },
            })
          }
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Dining Dollar Exchange</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.fixedHeader}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("DollarsCreateRequest")}
          >
            <Ionicons name="eye-outline" size={23} color="#38754A" />
            <Text style={styles.actionText}>Create request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("DollarsCreateOffer")}
          >
            <Ionicons name="wallet-outline" size={23} color="#38754A" />
            <Text style={styles.actionText}>Create offer</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.activePostsBar}
          onPress={() => navigation.navigate("DollarsActivePosts")}
        >
          <Text style={styles.activePostsText}>My active posts</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{diningDollarsPostCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#718474" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#A3A3A3" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location, price & more"
            placeholderTextColor="#A3A3A3"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        style={styles.postsList}
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredPosts.length === 0 ? [styles.postsListContent, styles.postsListContentEmpty] : styles.postsListContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedTitle}>No listings yet</Text>
            <Text style={styles.emptyFeedBody}>Be the first to create an offer or request.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DollarsPostCard post={item} buttonLabel="Claim" buttonDisabled wrapLocations={false} />
        )}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      />

      <Modal
        transparent
        animationType="fade"
        visible={showPostedPopup}
        onRequestClose={() => setShowPostedPopup(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#5CA671" />
            <Text style={styles.popupTitle}>
              {popupPostType.charAt(0).toUpperCase() + popupPostType.slice(1)} posted
            </Text>
            <Text style={styles.popupBody}>
              <Text>
                To manage your {popupPostType.toLowerCase()}, visit{" "}
                <Text style={styles.popupBodyBold}>My active posts.</Text>
              </Text>
              {"\n\n"}
              You'll be notified if anyone responds to your post. To complete the transfer, chat to
              finalize your meeting details.
            </Text>

            <TouchableOpacity style={styles.popupCloseButton} onPress={() => setShowPostedPopup(false)}>
              <Text style={styles.popupCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  postsList: {
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
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  postsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  postsListContentEmpty: {
    flexGrow: 1,
  },
  emptyFeed: {
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyFeedTitle: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },
  emptyFeedBody: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(0,0,0,0.55)",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionCard: {
    width: "48.5%",
    height: 90,
    backgroundColor: "rgba(93,176,117,0.30)",
    borderWidth: 2,
    borderColor: "#5DB075",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginTop: 8,
    fontSize: 24 / 1.6,
    color: "#38754A",
    fontWeight: "500",
  },
  activePostsBar: {
    backgroundColor: "rgba(191,210,197,0.30)",
    borderRadius: 10,
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  activePostsText: {
    fontSize: 13,
    color: "#5A7762",
  },
  countBadge: {
    backgroundColor: "#5A7762",
    borderRadius: 5,
    minWidth: 14,
    height: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 6,
  },
  countBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "500",
  },
  searchContainer: {
    height: 47,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D6D6D6",
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#111",
  },
  cardSeparator: {
    height: 16,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  popupCard: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 8,
  },
  popupTitle: {
    fontSize: 20,
    color: "#5CA671",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
  },
  popupBody: {
    fontSize: 12,
    color: "#111",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 14,
  },
  popupBodyBold: {
    fontWeight: "600",
  },
  popupCloseButton: {
    width: "100%",
    height: 41,
    borderRadius: 10,
    backgroundColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
  },
  popupCloseButtonText: {
    fontSize: 13,
    color: "#F7F7F7",
    fontWeight: "600",
  },
});
