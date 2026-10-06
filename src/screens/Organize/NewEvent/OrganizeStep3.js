// Step 3 of the new-event wizard — search for and add food/interest tags.
// Uses the same Searchbar component as steps 2 (and the inbox), and reuses
// AboutChip for the selected/removable tags rather than building a new chip
// component — the "add" search-result chip is a different-enough visual
// (outlined, plus icon) that it's kept local to this screen instead of
// extending AboutChip's Purple/Blue/Yellow, Display/Removable contract.
// Unlike steps 1-2, there's no required field here — tags are optional.

import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colorTokens } from "../../../theme/colorTokens";
import { useTheme } from "../../../rapi_ui_components";
import Searchbar from "../../../components/Searchbar";
import AboutChip from "../../../components/AboutChip";
import SubBodyText from "../../../components/typography/SubBodyText";
import eventTags from "../../../utils/eventTags";

const MAX_RESULTS = 8;

export default function OrganizeStep3({ tags, setTags }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 3) return [];
    return eventTags.filter((tag) => tag.toLowerCase().includes(trimmed) && !tags.includes(tag)).slice(0, MAX_RESULTS);
  }, [query, tags]);

  const handleAdd = (tag) => {
    setTags([...tags, tag]);
    setQuery("");
  };

  const handleRemove = (tag) => setTags(tags.filter((t) => t !== tag));

  return (
    <View style={styles.container}>
      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search food tags"
        containerStyle={styles.searchbarContainer}
      >
        {results.length > 0 ? (
          <View style={styles.chipWrap}>
            {results.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.resultChip, { borderColor: tokens.textLight }]}
                onPress={() => handleAdd(tag)}
              >
                <SubBodyText color={tokens.textMedium}>{tag}</SubBodyText>
                <Ionicons name="add" size={16} color={tokens.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </Searchbar>

      {tags.length > 0 && (
        <View style={styles.selectedWrap}>
          {tags.map((tag) => (
            <AboutChip key={tag} text={tag} color="Purple" type="Removable" onRemove={() => handleRemove(tag)} />
          ))}
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
    gap: 25,
  },
  // Searchbar carries its own horizontal/vertical padding (it's normally
  // dropped straight under a header); zero it out since it's nested inside
  // this step's own padded container instead.
  searchbarContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  resultChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 29,
    borderWidth: 0.5,
    borderRadius: 30,
    paddingLeft: 12,
    paddingRight: 10,
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
});
