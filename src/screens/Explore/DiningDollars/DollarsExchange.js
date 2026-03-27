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

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "Sebastian",
    age: "2h",
    type: "OFFER",
    priceText: "Up to $75",
    dateText: "11/7 - 12/20",
    locationText: "HUB, Cultivate, Local Point, Center Table +3",
    paymentMethods: ["Z", "V", "$", "C"],
  },
  {
    id: "2",
    author: "Kevin",
    age: "2h",
    type: "REQUEST",
    priceText: "$284 or more",
    dateText: "11/7",
    locationText: "Red Door, Thai Basil, Trillium, Umami Burger +1",
    paymentMethods: ["Z", "V"],
  },
  {
    id: "3",
    author: "Navneeth",
    age: "2h",
    type: "OFFER",
    priceText: "$20 - $50",
    dateText: "11/7 - 12/20",
    locationText: "Subway, Burger King, Pizza Hut, Chipotle +1",
    paymentMethods: ["Z", "V"],
  },
];

const PAYMENT_STYLE = {
  Z: { backgroundColor: "#5B2BD3" },
  V: { backgroundColor: "#2D8CFF" },
  $: { backgroundColor: "#19C85B" },
  C: { backgroundColor: "#28A745" },
};

const PostCard = ({ post }) => {
  return (
    <View style={styles.postCard}>
      <View style={styles.postTopRow}>
        <View style={styles.authorRow}>
          <Ionicons name="football-outline" size={14} color="#111" />
          <Text style={styles.authorText}>
            {post.author} {"\u2022"} {post.age}
          </Text>
        </View>

        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{post.type}</Text>
        </View>
      </View>

      <Text style={styles.priceText}>{post.priceText}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={14} color="#8A8A8A" />
        <Text style={styles.detailText}>{post.dateText}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={14} color="#8A8A8A" />
        <Text style={styles.detailText} numberOfLines={1}>
          {post.locationText}
        </Text>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.paymentRow}>
          {post.paymentMethods.map((method) => (
            <View key={`${post.id}-${method}`} style={[styles.paymentBadge, PAYMENT_STYLE[method]]}>
              <Text style={styles.paymentBadgeText}>{method}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.claimButton} disabled>
          <Text style={styles.claimButtonText}>Claim</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DollarsExchange({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostedPopup, setShowPostedPopup] = useState(false);
  const [popupPostType, setPopupPostType] = useState("offer");

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

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SAMPLE_POSTS;
    return SAMPLE_POSTS.filter((post) => {
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
        post.priceText.toLowerCase().includes(query) ||
        post.locationText.toLowerCase().includes(query) ||
        post.dateText.toLowerCase().includes(query) ||
        paymentSearchBlob.includes(query) ||
        post.type.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

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
            <Text style={styles.countBadgeText}>3</Text>
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
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsListContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PostCard post={item} />}
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
  postCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 7,
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  postTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorText: {
    marginLeft: 6,
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
  },
  typePill: {
    height: 16,
    borderRadius: 5,
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  typePillText: {
    fontSize: 8,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 28 / 1.85,
    color: "#111",
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
    flexShrink: 1,
  },
  cardBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  paymentBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  claimButton: {
    width: 63,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#BEBEBE",
    alignItems: "center",
    justifyContent: "center",
  },
  claimButtonText: {
    color: "#BEBEBE",
    fontSize: 12,
    fontWeight: "600",
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
