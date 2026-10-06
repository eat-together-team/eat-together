import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import FilterChip from "../../../components/FilterChip";
import SmallTextButton from "../../../components/SmallTextButton";
import Header4Text from "../../../components/typography/Header4Text";
import { colorTokens } from "../../../theme/colorTokens";
import { useTheme } from "../../../rapi_ui_components";
import yearTags from "../../../utils/yearTags";

// Content of the People screen's filter RBSheet — "Mutual friends"/"Similar
// interests" (same two special toggles as the quick-filter row above the
// list), the current user's own tags ("Your tags", minus whichever of those
// happen to be one of the fixed Year values so they aren't shown twice), and
// the Year section itself. Purely presentational — People.js owns all the
// selection state and passes it in.
const PeopleFilterSheet = ({
  userTags,
  mutualFriends,
  onToggleMutualFriends,
  similarInterests,
  onToggleSimilarInterests,
  selectedTagFilters,
  onToggleTag,
  onClear,
}) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const yourTags = userTags.filter((tag) => !yearTags.includes(tag.tag));
  const hasActiveFilters = mutualFriends || similarInterests || selectedTagFilters.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {hasActiveFilters && (
        <View style={styles.clearRow}>
          <SmallTextButton text="Clear filters" onPress={onClear} />
        </View>
      )}

      <View style={[styles.chipRow, styles.firstChipRow]}>
        <FilterChip
          text="Mutual friends"
          type="Display"
          color={mutualFriends ? "Purple" : "Clear"}
          onPress={onToggleMutualFriends}
        />
        <FilterChip
          text="Similar interests"
          type="Display"
          color={similarInterests ? "Purple" : "Clear"}
          onPress={onToggleSimilarInterests}
        />
      </View>

      {yourTags.length > 0 && (
        <View style={styles.section}>
          <Header4Text color={tokens.onBackground}>Your tags</Header4Text>
          <View style={styles.chipGrid}>
            {yourTags.map((tag) => (
              <FilterChip
                key={tag.tag}
                text={tag.tag}
                type="Display"
                color={selectedTagFilters.includes(tag.tag) ? "Purple" : "Clear"}
                onPress={() => onToggleTag(tag.tag)}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Header4Text color={tokens.onBackground}>Year</Header4Text>
        <View style={styles.chipGrid}>
          {yearTags.map((year) => (
            <FilterChip
              key={year}
              text={year}
              type="Display"
              color={selectedTagFilters.includes(year) ? "Purple" : "Clear"}
              onPress={() => onToggleTag(year)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 20,
  },
  clearRow: {
    alignItems: "flex-end",
  },
  firstChipRow: {
    marginTop: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: {
    gap: 15,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});

export default PeopleFilterSheet;
