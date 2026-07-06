import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Linking,
  Platform,
} from "react-native";
import { Layout, TopNav } from "../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import firebase from "firebase/compat/app";
import axios from "axios/dist/axios.min.js";
import { YELP_API_KEY } from "@env";

import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import SmallText from "../../components/SmallText";
import LargeText from "../../components/LargeText";
import EmptyState from "../../components/EmptyState";
import Filter from "../../components/Filter";
import HorizontalRow from "../../components/HorizontalRow";
import Link from "../../components/Link";
import RBSheet from "react-native-raw-bottom-sheet";
import { useRef } from "react";
import { auth, db } from "../../provider/Firebase";

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2.7 * 5 * numColumns) / numColumns;

function getPrimaryCategory(categories) {
  const raw = typeof categories === "string" ? categories : "";
  if (!raw) return "";
  return raw.includes(",") ? raw.substring(0, raw.indexOf(",")) : raw;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HOURS_TABLE_MAX_WIDTH = 280;

function formatYelpTime(hhmm) {
  if (!hhmm || hhmm.length !== 4) return "";
  const hour24 = parseInt(hhmm.slice(0, 2), 10);
  const minutes = hhmm.slice(2);
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

function getFormattedHoursRows(restaurant) {
  const hoursData = restaurant?.hours?.[0]?.open || [];
  if (!Array.isArray(hoursData) || hoursData.length === 0) return [];

  return DAY_NAMES.map((dayLabel, dayIndex) => {
    const entriesForDay = hoursData.filter((h) => h.day === dayIndex);
    if (!entriesForDay.length) {
      return { day: dayLabel, value: "Closed" };
    }
    const ranges = entriesForDay.map((h) => {
      const start = formatYelpTime(h.start);
      const end = formatYelpTime(h.end);
      return `${start} - ${end}`;
    });
    return { day: dayLabel, value: ranges.join(", ") };
  });
}

function splitAddressLines(address) {
  if (!address || typeof address !== "string") return { line1: "", line2: "" };
  const parts = address.split(", ").filter(Boolean);
  return {
    line1: parts[0] || "",
    line2: parts.slice(1).join(", ") || "",
  };
}

export default function StarredRestaurants({ route, navigation }) {
  const user = auth.currentUser;
  const [restaurants, setRestaurants] = useState(route.params?.restaurants || []);
  const isOwnProfile = route.params?.isOwnProfile === true;
  const profileName = route.params?.profileName || "";
  const title = isOwnProfile
    ? "My Restaurants"
    : profileName
    ? `${profileName}'s Restaurants`
    : "Restaurants";

  const [grid, setGrid] = useState(true);
  const [list, setList] = useState(false);
  const showViewFilterRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleUnstarRestaurant = async (restaurantId) => {
    if (!isOwnProfile) return;
    if (!user?.uid) return;
    const rid = restaurantId ? String(restaurantId) : "";
    if (!rid) return;

    const current = Array.isArray(restaurants) ? restaurants : [];
    const next = current.filter((r) => String(r?.id) !== rid);

    try {
      await db.collection("Users").doc(user.uid).update({
        starredRestaurants: next,
        starredRestaurantIDs: next.map((r) => r?.id).filter(Boolean),
        starredRestaurantsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setRestaurants(next);
      setSelectedRestaurant(null);
      setIsModalVisible(false);
    } catch (e) {
      console.log("Error unstarring restaurant:", e);
    }
  };

  const sortedRestaurants = useMemo(() => {
    const copy = [...restaurants];
    return copy.sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0));
  }, [restaurants]);

  const handleRestaurantPress = (r) => {
    setSelectedRestaurant(r);
    setIsModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const openId = route.params?.openRestaurantId;
      if (openId == null || openId === "") return;

      const paramList = route.params?.restaurants;
      if (!Array.isArray(paramList) || paramList.length === 0) {
        navigation.setParams({ openRestaurantId: undefined });
        return;
      }

      setRestaurants(paramList);
      const found = paramList.find((x) => String(x?.id) === String(openId));
      if (found) {
        setSelectedRestaurant(found);
        setIsModalVisible(true);
      }

      navigation.setParams({ openRestaurantId: undefined });
    }, [route.params?.openRestaurantId, route.params?.restaurants, navigation])
  );

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRestaurant(null);
  };

  const openSelectedAddressInMaps = async () => {
    const addr = selectedRestaurant?.address;
    if (!addr) return;
    const encodedAddress = encodeURIComponent(addr);
    const url = Platform.select({
      ios: `maps://app?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        );
      }
    } catch (e) {
      console.log("Error opening maps:", e);
    }
  };

  const modalCategoryList = useMemo(() => {
    if (!selectedRestaurant?.categories) return [];
    return String(selectedRestaurant.categories)
      .split(", ")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [selectedRestaurant?.categories]);

  const galleryAddress = selectedRestaurant
    ? splitAddressLines(selectedRestaurant.address)
    : { line1: "", line2: "" };

  const galleryHoursRows = selectedRestaurant
    ? getFormattedHoursRows(selectedRestaurant)
    : [];

  const hasLocationContent =
    !!galleryAddress.line1 ||
    !!galleryAddress.line2 ||
    !!(selectedRestaurant?.phone && String(selectedRestaurant.phone).trim());

  const enrichRestaurantDetails = async (restaurantId) => {
    const rid = restaurantId ? String(restaurantId) : "";
    if (!rid) return null;
    try {
      const resp = await axios.get(`https://api.yelp.com/v3/businesses/${rid}`, {
        headers: { Authorization: `Bearer ${YELP_API_KEY}` },
      });
      const d = resp?.data || {};
      return {
        hours: d.hours || null,
        photos: Array.isArray(d.photos) ? d.photos.slice(0, 6) : [],
        address: (d.location?.display_address || []).join(", "),
        phone: d.display_phone || "",
        serviceOptions: (d.transactions || []).join(", "),
      };
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const rid = selectedRestaurant?.id ? String(selectedRestaurant.id) : "";
    if (!isModalVisible || !rid) return;

    const missingDetails =
      !selectedRestaurant?.address ||
      (!selectedRestaurant?.hours && (!selectedRestaurant?.photos || 
        selectedRestaurant.photos.length === 0));

    if (!missingDetails) return;

    let cancelled = false;
    (async () => {
      setLoadingDetails(true);
      const extra = await enrichRestaurantDetails(rid);
      if (cancelled) return;
      setLoadingDetails(false);
      if (!extra) return;

      setSelectedRestaurant((prev) => (prev && String(prev.id) === rid ? 
        { ...prev, ...extra } : prev));

      let nextList = [];
      setRestaurants((prev) => {
        nextList = (Array.isArray(prev) ? prev : []).map((r) =>
          String(r?.id) === rid ? { ...r, ...extra } : r
        );
        return nextList;
      });

      if (isOwnProfile && user?.uid) {
        try {
          await db.collection("Users").doc(user.uid).update({
            starredRestaurants: nextList,
            starredRestaurantIDs: nextList.map((r) => r?.id).filter(Boolean),
            starredRestaurantsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } catch (e) {}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isModalVisible, selectedRestaurant?.id]);

  const renderRestaurantGrid = ({ item: r }) => {
    const category = getPrimaryCategory(r.categories).trim();

    return (
      <TouchableOpacity
        style={styles.tileContainer}
        activeOpacity={0.8}
        onPress={() => handleRestaurantPress(r)}
      >
        <ImageBackground
          source={r.imageUrl ? { uri: r.imageUrl } : require("../../../assets/foodBackground.png")}
          style={[styles.image, { width: tileSize, height: tileSize }]}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.85)"]}
            locations={[0, 0.5, 1]}
            style={styles.gradientOverlay}
          />
          <View style={styles.textOverlay}>
            <NormalText style={styles.title} numberOfLines={2} color="white">
              {r.name || "Restaurant"}
            </NormalText>
            {!!category && (
              <SmallText style={styles.subtitle} color="white" numberOfLines={1}>
                {category}
              </SmallText>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderRestaurantList = ({ item: r }) => {
    const category = getPrimaryCategory(r.categories).trim();
    const subtitleParts = [];
    if (r.price) subtitleParts.push(r.price);
    if (r.rating) subtitleParts.push(`${r.rating}★`);
    if (category) subtitleParts.push(category);

    return (
      <View style={styles.listItem}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.listCardTouch}
          onPress={() => handleRestaurantPress(r)}
        >
          <ImageBackground
            source={r.imageUrl ? { uri: r.imageUrl } : require("../../../assets/foodBackground.png")}
            style={[styles.listCardImage, { width: screenWidth - 24, height: 180 }]}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.85)"]}
              locations={[0, 0.5, 1]}
              style={styles.gradientOverlay}
            />
            <View style={styles.textOverlay}>
              <NormalText style={styles.title} numberOfLines={2} color="white">
                {r.name || "Restaurant"}
              </NormalText>
              {subtitleParts.length > 0 && (
                <SmallText style={styles.subtitle} color="white" numberOfLines={1}>
                  {subtitleParts.join(" • ")}
                </SmallText>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText>{title}</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />

      {sortedRestaurants.length > 0 && (
        <View style={styles.filterRow}>
          <HorizontalRow style={{ paddingHorizontal: 20 }}>
            <Filter
              checked={grid || list}
              onPress={() => showViewFilterRef.current?.open()}
              text={grid ? "Grid View" : list ? "List View" : "   View   "}
            />
            <RBSheet
              height={150}
              ref={showViewFilterRef}
              closeOnDragDown
              closeOnPressMask={false}
              customStyles={{
                wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
                draggableIcon: { backgroundColor: "black" },
                container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10 },
              }}
            >
              <Filter
                checked={grid}
                text="Grid View"
                marginBottom={5}
                onPress={() => {
                  setGrid(true);
                  setList(false);
                  showViewFilterRef.current?.close();
                }}
              />
              <Filter
                checked={list}
                text="List View"
                marginBottom={5}
                onPress={() => {
                  setList(true);
                  setGrid(false);
                  showViewFilterRef.current?.close();
                }}
              />
              <Link onPress={() => showViewFilterRef.current?.close()}>Close</Link>
            </RBSheet>
          </HorizontalRow>
        </View>
      )}

      <View style={styles.container}>
        {sortedRestaurants.length > 0 ? (
          <FlatList
            data={sortedRestaurants}
            renderItem={grid ? renderRestaurantGrid : renderRestaurantList}
            numColumns={grid ? numColumns : 1}
            key={grid ? "grid" : "list"}
            keyExtractor={(item, index) => item.id || `restaurant-${index}`}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <EmptyState
            title="No starred restaurants yet"
            text="Restaurants you star in the picker results will appear here."
          />
        )}
      </View>

      <Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
        <View style={styles.modalRoot}>
          <TopNav
            middleContent={<MediumText>   </MediumText>}
            leftContent={<Ionicons name="chevron-back" size={20} />}
            leftAction={handleCloseModal}
          />
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.modalBackground}>
              <Image
                style={{ width: screenWidth, height: screenWidth, resizeMode: "cover" }}
                source={
                  selectedRestaurant?.imageUrl
                    ? { uri: selectedRestaurant.imageUrl }
                    : require("../../../assets/foodBackground.png")
                }
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.modalBottom}>
            <ScrollView
              style={styles.modalBottomScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBottomScrollContent}
            >
            <View style={styles.modalTitleUnstarRow}>
              <LargeText
                color="#5DB075"
                size={20}
                numberOfLines={2}
                ellipsizeMode="tail"
                style={styles.modalRecNameInRow}
              >
                {selectedRestaurant?.name || "Restaurant"}
              </LargeText>
              {isOwnProfile && !!selectedRestaurant?.id ? (
                <TouchableOpacity
                  onPress={() => handleUnstarRestaurant(selectedRestaurant.id)}
                  style={styles.unstarButton}
                  activeOpacity={0.85}
                >
                  <Ionicons name="star" size={18} color="#F5C542" style={{ marginRight: 6 }} />
                  <NormalText style={{ color: "#5DB075" }} weight="bold">
                    Unstar
                  </NormalText>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.modalRecMetaOneRow}>
              {!!modalCategoryList[0] && (
                <MediumText color="#5DB075" size={15} lineHeight={18}>
                  {modalCategoryList[0]}
                </MediumText>
              )}
              {!!modalCategoryList[1] && (
                <>
                  {!!modalCategoryList[0] && (
                    <MediumText color="#5DB075" size={15} style={styles.modalRecMetaSep}>
                      {" "}
                      •{" "}
                    </MediumText>
                  )}
                  <MediumText color="#5DB075" size={15} lineHeight={18}>
                    {modalCategoryList[1]}
                  </MediumText>
                </>
              )}
              {!!selectedRestaurant?.price && (
                <>
                  {(!!modalCategoryList[0] || !!modalCategoryList[1]) && (
                    <MediumText color="#5DB075" size={15} style={styles.modalRecMetaSep}>
                      {" "}
                      •{" "}
                    </MediumText>
                  )}
                  <MediumText color="#5DB075" size={15}>
                    {selectedRestaurant.price}
                  </MediumText>
                </>
              )}
              {!!selectedRestaurant?.rating && (
                <>
                  {(!!modalCategoryList[0] ||
                    !!modalCategoryList[1] ||
                    !!selectedRestaurant?.price) && (
                    <MediumText color="#5DB075" size={15} style={styles.modalRecMetaSep}>
                      {" "}
                      •{" "}
                    </MediumText>
                  )}
                  <View style={styles.modalRecRatingInline}>
                    <MediumText color="#5DB075" size={15}>
                      {selectedRestaurant.rating}
                    </MediumText>
                    <Ionicons
                      name="star"
                      size={13}
                      color="#5DB075"
                      style={{ marginLeft: 3 }}
                    />
                  </View>
                </>
              )}
            </View>

            {loadingDetails && (
              <NormalText style={styles.galleryMetaMuted}>Loading details…</NormalText>
            )}

            {hasLocationContent && (
              <View style={styles.modalLocationSection}>
                <MediumText
                  color="#5DB075"
                  center
                  size={18}
                  style={styles.modalSheetSectionTitle}
                >
                  Location
                </MediumText>
                {!!galleryAddress.line1 && (
                  <NormalText
                    onPress={openSelectedAddressInMaps}
                    center
                    color="black"
                    size={16}
                    style={styles.galleryAddressTappable}
                  >
                    {galleryAddress.line1}
                  </NormalText>
                )}
                {!!galleryAddress.line2 && (
                  <NormalText
                    center
                    color="black"
                    size={16}
                    style={styles.galleryAddressLine}
                  >
                    {galleryAddress.line2}
                  </NormalText>
                )}
                {!!selectedRestaurant?.phone && (
                  <NormalText
                    center
                    color="black"
                    size={16}
                    style={styles.galleryPhoneLine}
                  >
                    Phone: {String(selectedRestaurant.phone).trim()}
                  </NormalText>
                )}
              </View>
            )}

            {galleryHoursRows.length > 0 && (
              <View style={styles.hoursBlock}>
                <MediumText
                  color="#5DB075"
                  center
                  size={18}
                  style={styles.modalSheetSectionTitle}
                >
                  Hours
                </MediumText>
                <View style={styles.hoursTableCenterWrap}>
                  <View style={styles.hoursTable}>
                    {galleryHoursRows.map(({ day, value }) => (
                      <View key={day} style={styles.hoursRow}>
                        <NormalText size={16} style={styles.hoursDay}>
                          {day}
                        </NormalText>
                        <NormalText size={16} style={styles.hoursTime} numberOfLines={2}>
                          {value}
                        </NormalText>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  filterRow: {
    marginBottom: 4,
  },

  flatListContent: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    justifyContent: "flex-start",
  },

  tileContainer: {
    margin: 5,
    width: tileSize,
    alignItems: "center",
  },

  image: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  imageStyle: {
    borderRadius: 10,
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingBottom: 6,
  },

  title: {
    textAlign: "left",
    width: "100%",
    fontSize: 13,
  },

  subtitle: {
    marginTop: 2,
    textAlign: "left",
    width: "100%",
  },

  listItem: {
    marginVertical: 8,
    paddingHorizontal: 5,
  },

  listCardTouch: {
    borderRadius: 10,
    overflow: "hidden",
  },

  listCardImage: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.82)",
  },

  modalRoot: {
    flex: 1,
    width: "100%",
  },

  modalBottom: {
    width: "100%",
    height: screenWidth - 100,
    backgroundColor: "white",
    alignSelf: "stretch",
  },

  modalBottomScroll: {
    flex: 1,
    width: "100%",
  },

  modalBottomScrollContent: {
    flexGrow: 1,
    width: "100%",
    paddingBottom: 24,
  },

  modalTitleUnstarRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },

  modalRecNameInRow: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  modalRecMetaOneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 14,
  },

  modalRecMetaSep: {
    opacity: 0.75,
  },

  modalRecRatingInline: {
    flexDirection: "row",
    alignItems: "center",
  },

  galleryMetaMuted: {
    alignSelf: "stretch",
    padding: 5,
    paddingHorizontal: 10,
    opacity: 0.6,
    textAlign: "center",
  },

  galleryAddressTappable: {
    width: "100%",
    paddingVertical: 4,
    paddingHorizontal: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },

  galleryAddressLine: {
    width: "100%",
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginTop: -2,
    textAlign: "center",
  },

  galleryPhoneLine: {
    width: "100%",
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginTop: 0,
    textAlign: "center",
  },

  modalLocationSection: {
    alignSelf: "stretch",
    width: "100%",
    paddingTop: 8,
    paddingBottom: 4,
  },

  modalSheetSectionTitle: {
    width: "100%",
    marginBottom: 12,
    letterSpacing: 0.4,
  },

  hoursBlock: {
    alignSelf: "stretch",
    width: "100%",
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 0,
  },

  hoursTableCenterWrap: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },

  hoursTable: {
    width: HOURS_TABLE_MAX_WIDTH,
    maxWidth: "100%",
  },

  hoursRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 3,
  },

  hoursDay: {
    width: 46,
    textAlign: "right",
    paddingRight: 10,
    marginLeft: 40,
  },

  hoursTime: {
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },

  unstarButton: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5DB075",
    backgroundColor: "#F7F7F7",
  },

});

