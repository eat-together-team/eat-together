// Step 2 of the new-event wizard — search for and pick a location. Search
// reuses the same yelpSearch provider Organize.js's old location picker
// used, and the same Searchbar component the inbox (Chats.js) uses —
// it already handles the pill/expanded-card shape and the >=3-character
// results reveal, so the results list is just passed in as its children.

import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Animated } from "react-native";
import debounce from "lodash.debounce";
import { Ionicons } from "@expo/vector-icons";

import { colorTokens } from "../../../theme/colorTokens";
import { useTheme } from "../../../rapi_ui_components";
import Searchbar from "../../../components/Searchbar";
import Header4Text from "../../../components/typography/Header4Text";
import SubBodyText from "../../../components/typography/SubBodyText";
import InformationCard from "../../../components/InformationCard";
import { yelpSearch } from "../../../provider/Search";

const MAX_RESULTS = 5;
const MIN_QUERY_LENGTH = 3;

export default function OrganizeStep2({ location, setLocation, error }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(errorOpacity, { toValue: error ? 1 : 0, duration: error ? 250 : 200, useNativeDriver: false }),
      Animated.spring(errorHeight, { toValue: error ? 1 : 0, friction: 8, tension: 40, useNativeDriver: false }),
    ]).start();
  }, [error]);

  const search = useMemo(
    () =>
      debounce(async (term) => {
        setSearching(true);
        const suggestions = await yelpSearch(term, { maxSearchResultsSize: MAX_RESULTS });
        setResults(suggestions);
        setSearching(false);
      }, 500),
    []
  );

  const handleChangeQuery = (text) => {
    setQuery(text);
    const trimmed = text.trim();
    if (trimmed.length >= MIN_QUERY_LENGTH) {
      search(trimmed);
    } else {
      search.cancel();
      setSearching(false);
      setResults([]);
    }
  };

  const handleSelect = (result) => {
    setLocation({ name: result.name, address: result.address, lat: result.lat, lng: result.lng });
    setQuery("");
    setResults([]);
  };

  const handleRemove = () => setLocation(null);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.errorContainer,
          { opacity: errorOpacity, maxHeight: errorHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) },
        ]}
      >
        {error && <InformationCard type="Error" text={error} />}
      </Animated.View>

      <Searchbar
        value={query}
        onChangeText={handleChangeQuery}
        placeholder="Search locations"
        containerStyle={styles.searchbarContainer}
      >
        {searching ? (
          <ActivityIndicator size="small" color={tokens.textMedium} />
        ) : results.length > 0 ? (
          results.map((result) => (
            <TouchableOpacity key={result.id} style={styles.resultRow} onPress={() => handleSelect(result)}>
              <View style={styles.resultText}>
                <Header4Text color={tokens.onBackground}>{result.name}</Header4Text>
                <SubBodyText color={tokens.textMedium}>{result.address}</SubBodyText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={tokens.onBackground} />
            </TouchableOpacity>
          ))
        ) : null}
      </Searchbar>

      {location && (
        <View style={styles.selectedRow}>
          <View style={styles.resultText}>
            <Header4Text color={tokens.onBackground}>{location.name}</Header4Text>
            <SubBodyText color={tokens.textMedium}>{location.address}</SubBodyText>
          </View>
          <TouchableOpacity onPress={handleRemove} hitSlop={8}>
            <Ionicons name="close" size={16} color={tokens.onBackground} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  errorContainer: {
    overflow: "hidden",
  },
  // Searchbar carries its own horizontal/vertical padding (it's normally
  // dropped straight under a header); zero it out since it's nested inside
  // this step's own padded container instead.
  searchbarContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  resultText: {
    gap: 2,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 15,
  },
});
