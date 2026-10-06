//Discover and filter suggested people, with search.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, LayoutAnimation, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import Searchbar from "../../../components/Searchbar";
import FilterChip from "../../../components/FilterChip";
import QuickFilterChipsSkeleton from "../../../components/QuickFilterChipsSkeleton";
import SuggestedPersonRow from "../../../components/SuggestedPersonRow";
import SuggestedPersonRowSkeleton from "../../../components/SuggestedPersonRowSkeleton";
import SmallUserListItem from "../../../components/SmallUserListItem";
import SmallUserListItemSkeleton from "../../../components/SmallUserListItemSkeleton";
import EmptyState from "../../../components/EmptyState";
import PeopleFilterSheet from "./PeopleFilterSheet";

import { colorTokens } from "../../../theme/colorTokens";
import { sortBySimilarInterests } from "../../../utils/methods";
import { tryoutId } from "../../../utils/constants";
import { db, auth } from "../../../provider/Firebase";

const BROWSE_SKELETON_ROWS = 10;
const SEARCH_SKELETON_ROWS = 6;

// Stable across renders — passed straight through to FlatList so unrelated
// state changes (typing, focus, filters) don't force every visible row to
// re-render on scroll.
const personKeyExtractor = (item) => item.id;

// RBSheet only supports a fixed pixel `height`, no content-hugging mode — so
// to make it hug anyway, an invisible off-screen copy of the same sheet
// content is rendered purely to measure its natural height (see the
// `sheetMeasurer` render below), and that measurement (plus this fixed
// drag-handle + padding chrome, from RBSheet's own default styles) becomes
// the real sheet's height. Capped so very long content (e.g. someone with
// many tags) scrolls instead of pushing the sheet past the top of the screen.
const SHEET_CHROME_HEIGHT = 65; // drag handle (25) + top/bottom padding (20 + 20)
const MAX_SHEET_HEIGHT = Dimensions.get("window").height * 0.85;
const FALLBACK_SHEET_HEIGHT = 400;

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const canFilter = user.uid !== tryoutId;

  const [userInfo, setUserInfo] = useState({});
  const [mutuals, setMutuals] = useState([]); // Mutual friends
  const [allUsers, setAllUsers] = useState([]); // Every searchable user (includes existing friends/private accounts)
  const [people, setPeople] = useState([]); // Suggested-people pool: allUsers minus friends and private accounts
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // Filters
  const [mutualFriendsOn, setMutualFriendsOn] = useState(false);
  const [similarInterestsOn, setSimilarInterestsOn] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState([]);

  // Search — `searchQuery` is the live text in the box; `submittedQuery` only
  // updates on Enter, and is what actually drives results/header collapse,
  // so typing alone never re-runs the search.
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

  // Animates the header collapsing/expanding and the quick filters
  // hiding/showing whenever entering or exiting search — otherwise those
  // layout changes just snap instantly.
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
      Animated.timing(resultsOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [hasQuery, submittedQuery, loading]);

  // Fades the browse list in once the skeleton rows are replaced by real
  // ones, instead of an instant swap — same pattern as resultsOpacity above.
  useEffect(() => {
    if (!hasQuery && !loading && !filtering) {
      browseOpacity.setValue(0);
      Animated.timing(browseOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [hasQuery, loading, filtering]);

  // Fetch every searchable user + this user's mutual friends. This is
  // intentionally broader than the "suggested people" pool below — search
  // needs to find someone regardless of whether you're already friends with
  // them or their account is private, neither of which should make them
  // unfindable by name.
  useEffect(() => {
    async function fetchData() {
      const ref = db.collection("Users");
      let userData;

      await ref.doc(user.uid).get().then((doc) => {
        userData = doc.data();
        setUserInfo(doc.data());

        (doc.data().friendIDs || []).forEach((id) => {
          db.collection("Users").doc(id).get().then((friendDoc) => {
            if (friendDoc && friendDoc.data()?.friendIDs) {
              setMutuals((prev) => prev.concat(friendDoc.data().friendIDs));
            }
          });
        });
      });

      await ref.onSnapshot((query) => {
        let users = [];
        query.forEach((doc) => {
          const data = doc.data();
          if (
            data.id !== user.uid &&
            data.id !== tryoutId &&
            data.verified &&
            !(userData.blockedIDs || []).includes(data.id) &&
            !(data.blockedIDs || []).includes(user.uid)
          ) {
            users.push(data);
          }
        });
        setAllUsers(users);
        setLoading(false);
      });
    }

    fetchData();
  }, []);

  // Suggested-people pool for the browse list/filters — narrower than
  // allUsers since discovery shouldn't suggest people you already know or
  // who've set their account private.
  useEffect(() => {
    setPeople(
      allUsers.filter(
        (p) => !p.settings?.privateAccount && !(userInfo.friendIDs || []).includes(p.id)
      )
    );
  }, [allUsers, userInfo]);

  // Apply Mutual friends / tag filters, then Similar interests re-sort —
  // same pipeline shape as the old People.js's filter effect.
  useEffect(() => {
    async function applyFilters() {
      setFiltering(true);
      let result = [...people];

      if (mutualFriendsOn) {
        result = result.filter((p) => mutuals.includes(p.id));
      }

      if (selectedTagFilters.length > 0) {
        result = result.filter((p) =>
          (p.tags || []).some((tag) => selectedTagFilters.includes(tag.tag))
        );
      }

      if (similarInterestsOn) {
        result = await sortBySimilarInterests(userInfo, result);
      }

      setFilteredPeople(result);
      setFiltering(false);
    }

    applyFilters();
  }, [people, mutualFriendsOn, selectedTagFilters, similarInterestsOn, mutuals]);

  const isMatch = (person, text) => {
    const fullName = person.firstName + " " + person.lastName;
    if (fullName.toLowerCase().includes(text.toLowerCase())) return true;
    if (person.username && person.username.toLowerCase().includes(text.toLowerCase())) return true;
    return (person.tags || []).some((tag) => tag.tag.toLowerCase().includes(text.toLowerCase()));
  };

  const searchResults = useMemo(() => {
    const text = submittedQuery.trim();
    if (!text) return [];
    return allUsers.filter((p) => isMatch(p, text));
  }, [submittedQuery, allUsers]);

  const onToggleTag = useCallback((tagString) => {
    setSelectedTagFilters((prev) =>
      prev.includes(tagString) ? prev.filter((t) => t !== tagString) : [...prev, tagString]
    );
  }, []);

  const onClearFilters = () => {
    setMutualFriendsOn(false);
    setSimilarInterestsOn(false);
    setSelectedTagFilters([]);
  };

  const handleChangeSearchText = (text) => {
    setSearchQuery(text);
    // Clearing the box exits search immediately rather than leaving stale
    // results up until another Enter press.
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

  // Stable reference so SuggestedPersonRow/SmallUserListItem (both
  // React.memo'd) can skip re-rendering on scroll when unrelated screen
  // state changes.
  const goToProfile = useCallback(
    (person) => navigation.navigate("FullProfile", { person }),
    [navigation]
  );

  const renderPersonRow = useCallback(
    ({ item }) => <SuggestedPersonRow person={item} onPress={goToProfile} />,
    [goToProfile]
  );

  const renderSearchResultRow = useCallback(
    ({ item }) => <SmallUserListItem person={item} onPress={goToProfile} />,
    [goToProfile]
  );

  const filterSheetProps = {
    userTags: userInfo.tags || [],
    mutualFriends: mutualFriendsOn,
    onToggleMutualFriends: () => setMutualFriendsOn((v) => !v),
    similarInterests: similarInterestsOn,
    onToggleSimilarInterests: () => setSimilarInterestsOn((v) => !v),
    selectedTagFilters,
    onToggleTag,
    onClear: onClearFilters,
  };

  return (
    <Layout>
      {!hasQuery && <SmallAppBar title="People" onBack={() => navigation.goBack()} />}

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
            placeholder="Search by name, tags & more"
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
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickFilters}
              keyExtractor={(item) => item}
              data={["Mutual friends", "Similar interests", ...(userInfo.tags || []).map((t) => t.tag)]}
              renderItem={({ item }) => {
                if (item === "Mutual friends") {
                  return (
                    <FilterChip
                      text="Mutual friends"
                      type="Display"
                      color={mutualFriendsOn ? "Purple" : "Clear"}
                      onPress={() => setMutualFriendsOn((v) => !v)}
                    />
                  );
                }
                if (item === "Similar interests") {
                  return (
                    <FilterChip
                      text="Similar interests"
                      type="Display"
                      color={similarInterestsOn ? "Purple" : "Clear"}
                      onPress={() => setSimilarInterestsOn((v) => !v)}
                    />
                  );
                }
                return (
                  <FilterChip
                    text={item}
                    type="Display"
                    color={selectedTagFilters.includes(item) ? "Purple" : "Clear"}
                    onPress={() => onToggleTag(item)}
                  />
                );
              }}
            />
          )
        )}
      </View>

      <View style={styles.content}>
        {hasQuery ? (
          <Animated.View style={[styles.content, { opacity: resultsOpacity }]}>
            {loading ? (
              <View style={styles.list}>
                {Array.from({ length: SEARCH_SKELETON_ROWS }).map((_, index) => (
                  <SmallUserListItemSkeleton key={index} />
                ))}
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                contentContainerStyle={styles.list}
                keyExtractor={personKeyExtractor}
                data={searchResults}
                renderItem={renderSearchResultRow}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
              />
            ) : (
              <EmptyState title="No results" text={`No one matches "${submittedQuery.trim()}"`} />
            )}
          </Animated.View>
        ) : loading || filtering ? (
          <View style={styles.list}>
            {Array.from({ length: BROWSE_SKELETON_ROWS }).map((_, index) => (
              <SuggestedPersonRowSkeleton key={index} />
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.content, { opacity: browseOpacity }]}>
            {filteredPeople.length > 0 ? (
              <FlatList
                contentContainerStyle={styles.list}
                keyExtractor={personKeyExtractor}
                data={filteredPeople}
                renderItem={renderPersonRow}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
              />
            ) : (
              <EmptyState title="No people found" text="Try adjusting your filters." />
            )}
          </Animated.View>
        )}
      </View>

      {/* Invisible off-screen copy of the sheet content, purely to measure
          its natural height (see SHEET_CHROME_HEIGHT comment above) — kept
          the same width as the real sheet's content area so text/chip
          wrapping (and therefore height) measures identically. */}
      <View style={styles.sheetMeasurer} pointerEvents="none" onLayout={handleMeasureSheetContent}>
        <PeopleFilterSheet {...filterSheetProps} />
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
        <PeopleFilterSheet {...filterSheetProps} />
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
    gap: 10,
    paddingBottom: 15,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 20,
  },
});
