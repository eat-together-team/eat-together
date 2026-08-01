//Full, filterable/searchable list of upcoming events — reached via "View all" on the Explore feed's Events row.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, LayoutAnimation, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import { Layout, useTheme } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import FilterChip from "../../components/FilterChip";
import QuickFilterChipsSkeleton from "../../components/QuickFilterChipsSkeleton";
import EventListingCard from "../../components/EventListingCard";
import EventListingCardSkeleton from "../../components/EventListingCardSkeleton";
import RecommendationEventCard from "../../components/RecommendationEventCard";
import EmptyState from "../../components/EmptyState";
import EventsFilterSheet from "./EventsFilterSheet";

import { colorTokens } from "../../theme/colorTokens";
import { isAvailable, getTimeOfDay, compareDates } from "../../utils/methods";
import { tryoutId } from "../../utils/constants";
import { db, auth } from "../../provider/Firebase";

const BROWSE_SKELETON_ROWS = 4;
const SEARCH_SKELETON_ROWS = 4;

const eventKeyExtractor = (item) => item.id;

// RBSheet only supports a fixed pixel `height`, no content-hugging mode — so
// to make it hug anyway, an invisible off-screen copy of the same sheet
// content is rendered purely to measure its natural height (see the
// `measurer` render below), and that measurement (plus this fixed
// drag-handle + padding chrome, from RBSheet's own default styles) becomes
// the real sheet's height. Capped so very long content scrolls instead of
// pushing the sheet past the top of the screen.
const SHEET_CHROME_HEIGHT = 65; // drag handle (25) + top/bottom padding (20 + 20)
const MAX_SHEET_HEIGHT = Dimensions.get("window").height * 0.85;
const FALLBACK_SHEET_HEIGHT = 400;

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const canFilter = user.uid !== tryoutId;

  const [userInfo, setUserInfo] = useState({});
  const [events, setEvents] = useState([]); // Eligible upcoming public events
  const [recommendations, setRecommendations] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // Filters
  const [friendsAttendingOn, setFriendsAttendingOn] = useState(false);
  const [fitsScheduleOn, setFitsScheduleOn] = useState(false);
  const [popularOn, setPopularOn] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(null); // null | 'morning' | 'afternoon' | 'evening'
  const [visibility, setVisibility] = useState(null); // null | 'public' | 'private'
  const [hostedBy, setHostedBy] = useState(null); // null (Anyone) | 'me' | 'friends'

  // Search — mirrors People.js: `searchQuery` is the live text in the box,
  // `submittedQuery` only updates on Enter and is what actually drives
  // results/header collapse.
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const hasQuery = submittedQuery.trim().length > 0;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const browseOpacity = useRef(new Animated.Value(0)).current;

  const filterSheetRef = useRef();
  const [sheetHeight, setSheetHeight] = useState(FALLBACK_SHEET_HEIGHT);

  const handleMeasureSheetContent = (e) => {
    const measured = Math.min(e.nativeEvent.layout.height + SHEET_CHROME_HEIGHT, MAX_SHEET_HEIGHT);
    setSheetHeight(measured);
  };

  const animateLayout = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
  };

  useEffect(() => {
    if (hasQuery) {
      resultsOpacity.setValue(0);
      Animated.timing(resultsOpacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  }, [hasQuery, submittedQuery, loading]);

  useEffect(() => {
    if (!hasQuery && !loading && !filtering) {
      browseOpacity.setValue(0);
      Animated.timing(browseOpacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  }, [hasQuery, loading, filtering]);

  // Fetch this user's info + the eligible upcoming public events pool.
  useEffect(() => {
    async function fetchData() {
      let userData;

      await db.collection("Users").doc(user.uid).get().then((doc) => {
        userData = doc.data();
        setUserInfo(doc.data());
      });

      await db.collection("Public Events").onSnapshot((query) => {
        let newEvents = [];
        query.forEach((doc) => {
          const data = doc.data();
          if (data.visibleTo != null && !data.visibleTo.includes(user.uid) && data.hostID !== user.uid) return;
          if ((userData?.blockedIDs || []).includes(data.hostID)) return;

          const eventDate = data.startDate ? data.startDate.toDate() : data.date.toDate();
          if (eventDate > new Date()) newEvents.push(data);
        });

        newEvents.sort(compareDates);
        setEvents(newEvents);
        setLoading(false);
      });
    }

    fetchData();
  }, []);

  // AI-curated meetup suggestions — referenced from this user's
  // notifications, same "Private Events" lookup Home.js's fetchRecs does.
  useEffect(() => {
    const unsubscribe = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      const data = doc.data();
      if (!data) return;

      const recIDs = (data.notifications || [])
        .filter((notif) => notif.type === "recommendation")
        .map((notif) => notif.id);

      if (recIDs.length === 0) {
        setRecommendations([]);
        return;
      }

      Promise.all(
        recIDs.map((id) =>
          db.collection("Private Events").doc(id).get().then((recDoc) => {
            const recData = recDoc.data();
            if (!recData) return null;
            return { ...recData, isARec: true, hostFirstName: "Eat Together Team!", hostLastName: "" };
          })
        )
      ).then((recEvents) => {
        setRecommendations(recEvents.filter(Boolean).sort(compareDates));
      });
    });

    return () => unsubscribe();
  }, []);

  // Filter, then Popular re-sort — same pipeline shape as People.js.
  useEffect(() => {
    async function applyFilters() {
      setFiltering(true);
      let result = [...events];

      if (friendsAttendingOn) {
        result = result.filter((e) =>
          (e.attendees || []).some((uid) => (userInfo.friendIDs || []).includes(uid))
        );
      }

      if (fitsScheduleOn) {
        result = result.filter((e) => isAvailable(userInfo, e));
      }

      if (timeOfDay) {
        result = result.filter((e) => {
          const eventDate = e.startDate ? e.startDate.toDate() : e.date.toDate();
          return getTimeOfDay(eventDate) === timeOfDay;
        });
      }

      if (visibility === "public") {
        result = result.filter((e) => e.visibleTo == null);
      } else if (visibility === "private") {
        result = result.filter((e) => e.visibleTo != null);
      }

      if (hostedBy === "me") {
        result = result.filter((e) => e.hostID === user.uid);
      } else if (hostedBy === "friends") {
        result = result.filter((e) => (userInfo.friendIDs || []).includes(e.hostID));
      }

      if (popularOn) {
        result = [...result].sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0));
      }

      setFilteredEvents(result);
      setFiltering(false);
    }

    applyFilters();
  }, [events, friendsAttendingOn, fitsScheduleOn, timeOfDay, visibility, hostedBy, popularOn, userInfo]);

  const isMatch = (event, text) => {
    if (event.name.toLowerCase().includes(text.toLowerCase())) return true;
    if ((event.tags || []).some((tag) => tag.toLowerCase().includes(text.toLowerCase()))) return true;
    if (event.hostName) return event.hostName.toLowerCase().includes(text.toLowerCase());
    const fullName = `${event.hostFirstName} ${event.hostLastName}`;
    return fullName.toLowerCase().includes(text.toLowerCase());
  };

  const searchResults = useMemo(() => {
    const text = submittedQuery.trim();
    if (!text) return [];
    return events.filter((e) => isMatch(e, text));
  }, [submittedQuery, events]);

  const onToggleFriendsAttending = () => setFriendsAttendingOn((v) => !v);
  const onToggleFitsSchedule = () => setFitsScheduleOn((v) => !v);
  const onTogglePopular = () => setPopularOn((v) => !v);
  const onSelectTimeOfDay = (value) => setTimeOfDay((prev) => (prev === value ? null : value));
  const onSelectVisibility = (value) => setVisibility((prev) => (prev === value ? null : value));
  const onSelectHostedBy = (value) => setHostedBy((prev) => (prev === value ? null : value));

  const onClearFilters = () => {
    setFriendsAttendingOn(false);
    setFitsScheduleOn(false);
    setPopularOn(false);
    setTimeOfDay(null);
    setVisibility(null);
    setHostedBy(null);
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

  const goToEvent = useCallback(
    (event) => navigation.navigate("FullCard", { event }),
    [navigation]
  );

  const goToRecommendation = useCallback(
    (event) => navigation.navigate("Recommendation", { event, userData: userInfo }),
    [navigation, userInfo]
  );

  const renderBrowseItem = useCallback(
    ({ item }) =>
      item.isARec ? (
        <RecommendationEventCard event={item} onPress={goToRecommendation} />
      ) : (
        <EventListingCard event={item} onPress={goToEvent} />
      ),
    [goToEvent, goToRecommendation]
  );

  const renderSearchResultCard = useCallback(
    ({ item }) => <EventListingCard event={item} onPress={goToEvent} />,
    [goToEvent]
  );

  const browseData = useMemo(() => [...recommendations, ...filteredEvents], [recommendations, filteredEvents]);

  const filterSheetProps = {
    friendsAttending: friendsAttendingOn,
    onToggleFriendsAttending,
    fitsSchedule: fitsScheduleOn,
    onToggleFitsSchedule,
    popular: popularOn,
    onTogglePopular,
    timeOfDay,
    onSelectTimeOfDay,
    visibility,
    onSelectVisibility,
    hostedBy,
    onSelectHostedBy,
    onClear: onClearFilters,
  };

  return (
    <Layout>
      {!hasQuery && <SmallAppBar title="Events" onBack={() => navigation.goBack()} />}

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          {hasQuery && (
            <TouchableOpacity onPress={exitSearch}>
              <Ionicons name="arrow-back" size={24} color={tokens.onBackground} />
            </TouchableOpacity>
          )}
          <Searchbar
            value={searchQuery}
            onChangeText={handleChangeSearchText}
            placeholder="Search by title, tags & more"
            onSubmitEditing={handleSubmitSearch}
            containerStyle={styles.searchbarContainer}
          />
          {canFilter && !hasQuery && (
            <TouchableOpacity onPress={() => filterSheetRef.current?.open()}>
              <Ionicons name="funnel-outline" size={24} color={tokens.onBackground} />
            </TouchableOpacity>
          )}
        </View>

        {canFilter && !hasQuery && (
          loading ? (
            <QuickFilterChipsSkeleton />
          ) : (
            <View style={styles.quickFilters}>
              <FilterChip
                text="Friends attending"
                type="Display"
                color={friendsAttendingOn ? "Green" : "Clear"}
                onPress={onToggleFriendsAttending}
              />
              <FilterChip
                text="Fits schedule"
                type="Display"
                color={fitsScheduleOn ? "Green" : "Clear"}
                onPress={onToggleFitsSchedule}
              />
              <FilterChip
                text="Popular"
                type="Display"
                color={popularOn ? "Green" : "Clear"}
                onPress={onTogglePopular}
              />
            </View>
          )
        )}
      </View>

      <View style={styles.content}>
        {hasQuery ? (
          <Animated.View style={[styles.content, { opacity: resultsOpacity }]}>
            {loading ? (
              <View style={styles.list}>
                {Array.from({ length: SEARCH_SKELETON_ROWS }).map((_, index) => (
                  <EventListingCardSkeleton key={index} />
                ))}
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                contentContainerStyle={styles.list}
                keyExtractor={eventKeyExtractor}
                data={searchResults}
                renderItem={renderSearchResultCard}
              />
            ) : (
              <EmptyState title="No results" text={`No events match "${submittedQuery.trim()}"`} />
            )}
          </Animated.View>
        ) : loading || filtering ? (
          <View style={styles.list}>
            {Array.from({ length: BROWSE_SKELETON_ROWS }).map((_, index) => (
              <EventListingCardSkeleton key={index} />
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.content, { opacity: browseOpacity }]}>
            {browseData.length > 0 ? (
              <FlatList
                contentContainerStyle={styles.list}
                keyExtractor={eventKeyExtractor}
                data={browseData}
                renderItem={renderBrowseItem}
              />
            ) : (
              <EmptyState title="No events found" text="Organize your own, or try adjusting your filters." />
            )}
          </Animated.View>
        )}
      </View>

      {/* Invisible off-screen copy of the sheet content, purely to measure
          its natural height (see SHEET_CHROME_HEIGHT comment above) — kept
          the same width as the real sheet's content area so text/chip
          wrapping (and therefore height) measures identically. */}
      <View style={styles.sheetMeasurer} pointerEvents="none" onLayout={handleMeasureSheetContent}>
        <EventsFilterSheet {...filterSheetProps} />
      </View>

      <RBSheet
        ref={filterSheetRef}
        height={sheetHeight}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: tokens.textLight },
          container: {
            backgroundColor: tokens.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          },
        }}
      >
        <EventsFilterSheet {...filterSheetProps} />
      </RBSheet>
    </Layout>
  );
}

const styles = StyleSheet.create({
  sheetMeasurer: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    opacity: 0,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 15,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  searchbarContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  quickFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    gap: 25,
  },
});
