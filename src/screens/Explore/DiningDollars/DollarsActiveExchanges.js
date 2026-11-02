// Active exchanges — "My posts" (what I posted, with Edit) and "My exchanges"
// (posts I've asked to claim/fulfill, chipped PENDING or READY). Opened from
// the top-right icon on the Dining Dollar Exchange page.

import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import EmptySectionPlaceholder from "../../../components/EmptySectionPlaceholder";
import Header4Text from "../../../components/typography/Header4Text";
import DollarsPostCard from "../../../components/DiningDollars/DollarsPostCard";
import DollarsPostCardSkeleton from "../../../components/DiningDollars/DollarsPostCardSkeleton";

import { colorTokens } from "../../../theme/colorTokens";
import { db, auth } from "../../../provider/Firebase";
import { DINING_DOLLARS_POSTS_COLLECTION, POST_STATUS, toDate } from "./dollarsPostSchema";
import { myDollarsExchangesQuery, viewerChipVariant } from "./dollarsClaims";

const SKELETON_ROWS = 3;
const TABS = [
  { key: "posts", label: "My posts" },
  { key: "exchanges", label: "My exchanges" },
];

const isOngoing = (post) => post.status === POST_STATUS.ACTIVE || post.status === POST_STATUS.MATCHED;
const newestFirst = (a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0);
const postKeyExtractor = (item) => item.id;

// Subscribes to a posts query, keeping only ongoing posts, newest first.
// Status is filtered here rather than in the query so no composite index is needed.
const useOngoingPosts = (makeQuery) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = makeQuery().onSnapshot(
      (query) => {
        const next = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(isOngoing);
        next.sort(newestFirst);
        setPosts(next);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, []);

  return { posts, loading };
};

const TabBar = ({ active, onChange, tokens }) => (
  <View style={[styles.tabBar, { borderBottomColor: tokens.containerMedium }]}>
    {TABS.map((tab) => {
      const selected = tab.key === active;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selected && { borderBottomColor: tokens.primary }]}
          onPress={() => onChange(tab.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
        >
          <Header4Text color={selected ? tokens.primary : tokens.textMedium} center>
            {tab.label}
          </Header4Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState("posts");

  const myPosts = useOngoingPosts(() =>
    db.collection(DINING_DOLLARS_POSTS_COLLECTION).where("ownerID", "==", user.uid)
  );
  const myExchanges = useOngoingPosts(() => myDollarsExchangesQuery(db, user.uid));

  const goToPost = useCallback(
    (post) => navigation.navigate("DollarsPostDetail", { postId: post.id }),
    [navigation]
  );
  const editPost = useCallback(
    (post) => navigation.navigate("DollarsEditPost", { postId: post.id }),
    [navigation]
  );

  const renderMyPost = useCallback(
    ({ item }) => (
      <DollarsPostCard
        post={item}
        chipVariant={viewerChipVariant(item, user.uid)}
        onPress={goToPost}
        // Matched posts are locked until the exchange completes or is cancelled.
        onEdit={item.status === POST_STATUS.ACTIVE ? editPost : undefined}
      />
    ),
    [goToPost, editPost]
  );

  const renderMyExchange = useCallback(
    ({ item }) => <DollarsPostCard post={item} chipVariant={viewerChipVariant(item, user.uid)} onPress={goToPost} />,
    [goToPost]
  );

  const isPostsTab = activeTab === "posts";
  const { posts, loading } = isPostsTab ? myPosts : myExchanges;

  return (
    <Layout>
      <SmallAppBar title="Active exchanges" onBack={() => navigation.goBack()} />
      <TabBar active={activeTab} onChange={setActiveTab} tokens={tokens} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.list}>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <DollarsPostCardSkeleton key={index} />
            ))}
          </View>
        ) : posts.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.list}
            keyExtractor={postKeyExtractor}
            data={posts}
            renderItem={isPostsTab ? renderMyPost : renderMyExchange}
          />
        ) : (
          <EmptySectionPlaceholder
            icon={isPostsTab ? "document-text-outline" : "swap-horizontal"}
            text={isPostsTab ? "You don't have any active posts" : "You don't have any active exchanges"}
          />
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
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
