// Dining Dollar Exchange central page — create buttons, search, and the feed of
// ongoing offers/requests. Reached from the Dining Dollar promo card on Explore.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, LayoutAnimation, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import Searchbar from "../../../components/Searchbar";
import LargeButton from "../../../components/LargeButton";
import EmptySectionPlaceholder from "../../../components/EmptySectionPlaceholder";
import DollarsPostCard from "../../../components/DiningDollars/DollarsPostCard";
import DollarsPostCardSkeleton from "../../../components/DiningDollars/DollarsPostCardSkeleton";
import DollarsWelcomeDialog from "../../../components/DiningDollars/DollarsWelcomeDialog";

import { colorTokens } from "../../../theme/colorTokens";
import { db, auth } from "../../../provider/Firebase";
import { DINING_DOLLARS_POSTS_COLLECTION, POST_STATUS, isDollarsPostExpired, toDate } from "./dollarsPostSchema";
import { viewerChipVariant } from "./dollarsClaims";
import { getDollarsLocation, getDollarsPaymentMethod } from "./dollarsConstants";

const SKELETON_ROWS = 4;

const postKeyExtractor = (item) => item.id;

const newestFirst = (a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0);

// Searchable text for a post: poster, type, amount, location and payment names.
const postSearchText = (post) =>
  [
    post.ownerDisplayName,
    post.postType,
    post.amountTitle,
    ...(post.preferredLocations || []).map((id) => getDollarsLocation(id)?.label),
    ...(post.paymentMethods || []).map((id) => getDollarsPaymentMethod(id)?.label),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;

  const [posts, setPosts] = useState([]);
  const [blockedIDs, setBlockedIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  // Same live/submitted split as AllEvents.js: results only change on Enter.
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const hasQuery = submittedQuery.trim().length > 0;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const animateLayout = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
  };

  // Blocked users + the one-time welcome dialog.
  useEffect(() => {
    db.collection("Users").doc(user.uid).get().then((doc) => {
      const data = doc.data();
      setBlockedIDs(data?.blockedIDs || []);
      if (!data?.settings?.hasSeenDiningDollarsWelcome) setWelcomeVisible(true);
    });
  }, []);

  // Ongoing posts. Matched posts only stay in the feed for the two people in
  // the exchange, so a READY chip keeps showing for them here.
  useEffect(() => {
    const unsubscribe = db
      .collection(DINING_DOLLARS_POSTS_COLLECTION)
      .where("status", "in", [POST_STATUS.ACTIVE, POST_STATUS.MATCHED])
      .onSnapshot(
        (query) => {
          const next = [];
          query.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            if (isDollarsPostExpired(data)) return;
            if (data.status === POST_STATUS.MATCHED && data.ownerID !== user.uid && data.acceptedClaimantID !== user.uid) return;
            next.push(data);
          });
          next.sort(newestFirst);
          setPosts(next);
          setLoading(false);
        },
        () => setLoading(false)
      );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      contentOpacity.setValue(0);
      Animated.timing(contentOpacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  }, [loading, hasQuery, submittedQuery]);

  const visiblePosts = useMemo(() => {
    const unblocked = posts.filter((p) => !blockedIDs.includes(p.ownerID));
    const text = submittedQuery.trim().toLowerCase();
    if (!text) return unblocked;
    return unblocked.filter((p) => postSearchText(p).includes(text));
  }, [posts, blockedIDs, submittedQuery]);

  const closeWelcome = () => {
    setWelcomeVisible(false);
    db.collection("Users").doc(user.uid).update({ "settings.hasSeenDiningDollarsWelcome": true }).catch(() => {});
  };

  const handleChangeSearchText = (text) => {
    setSearchQuery(text);
    if (text.trim().length === 0 && hasQuery) {
      animateLayout();
      setSubmittedQuery("");
    }
  };

  const handleSubmitSearch = () => {
    if (!hasQuery) animateLayout();
    setSubmittedQuery(searchQuery);
    Keyboard.dismiss();
  };

  const exitSearch = () => {
    animateLayout();
    setSearchQuery("");
    setSubmittedQuery("");
    Keyboard.dismiss();
  };

  const goToPost = useCallback(
    (post) => navigation.navigate("DollarsPostDetail", { postId: post.id }),
    [navigation]
  );

  const renderPost = useCallback(
    ({ item }) => <DollarsPostCard post={item} chipVariant={viewerChipVariant(item, user.uid)} onPress={goToPost} />,
    [goToPost]
  );

  return (
    <Layout>
      {!hasQuery && (
        <SmallAppBar
          title="Dining Dollar Exchange"
          onBack={() => navigation.goBack()}
          actions={[{ icon: "swap-horizontal", onPress: () => navigation.navigate("DollarsActiveExchanges") }]}
        />
      )}

      {!hasQuery && (
        <View style={styles.createRow}>
          <LargeButton
            outlined
            color="green"
            style={styles.createButton}
            onPress={() => navigation.navigate("DollarsCreatePost", { postType: "request" })}
            leadingIcon={<Ionicons name="hand-left-outline" size={16} color={tokens.primary} />}
          >
            Create request
          </LargeButton>
          <LargeButton
            color="green"
            style={styles.createButton}
            onPress={() => navigation.navigate("DollarsCreatePost", { postType: "offer" })}
            leadingIcon={<Ionicons name="add" size={16} color={tokens.onPrimary} />}
          >
            Create offer
          </LargeButton>
        </View>
      )}

      <View style={styles.searchRow}>
        {hasQuery && (
          <TouchableOpacity onPress={exitSearch}>
            <Ionicons name="arrow-back" size={24} color={tokens.onBackground} />
          </TouchableOpacity>
        )}
        <Searchbar
          value={searchQuery}
          onChangeText={handleChangeSearchText}
          placeholder="Search ongoing offers and requests"
          onSubmitEditing={handleSubmitSearch}
          containerStyle={styles.searchbarContainer}
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.list}>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <DollarsPostCardSkeleton key={index} />
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
            {visiblePosts.length > 0 ? (
              <FlatList
                contentContainerStyle={styles.list}
                keyExtractor={postKeyExtractor}
                data={visiblePosts}
                renderItem={renderPost}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <EmptySectionPlaceholder
                icon={hasQuery ? "search-outline" : "cash-outline"}
                text={hasQuery ? `No posts match "${submittedQuery.trim()}"` : "There aren't any ongoing posts"}
              />
            )}
          </Animated.View>
        )}
      </View>

      <DollarsWelcomeDialog visible={welcomeVisible} onEnter={closeWelcome} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  createRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  createButton: {
    flex: 1,
    width: undefined,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 20,
  },
  searchbarContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 15,
  },
});
