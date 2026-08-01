import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import FilterChip from "../../components/FilterChip";
import SmallTextButton from "../../components/SmallTextButton";
import Header4Text from "../../components/typography/Header4Text";
import { colorTokens } from "../../theme/colorTokens";
import { useTheme } from "../../rapi_ui_components";

// Content of the Events screen's filter RBSheet — the same three quick
// toggles as the row above the list (Friends attending / Fits schedule /
// Popular), plus three single-select groups (Time of day, Visibility,
// Hosted by). Purely presentational — AllEvents.js owns all selection state.
const EventsFilterSheet = ({
  friendsAttending,
  onToggleFriendsAttending,
  fitsSchedule,
  onToggleFitsSchedule,
  popular,
  onTogglePopular,
  timeOfDay,
  onSelectTimeOfDay,
  visibility,
  onSelectVisibility,
  hostedBy,
  onSelectHostedBy,
  onClear,
}) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const hasActiveFilters =
    friendsAttending || fitsSchedule || popular || timeOfDay || visibility || hostedBy;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {hasActiveFilters && (
        <View style={styles.clearRow}>
          <SmallTextButton text="Clear filters" onPress={onClear} />
        </View>
      )}

      <View style={[styles.chipGrid, styles.firstChipGrid]}>
        <FilterChip
          text="Friends attending"
          type="Display"
          color={friendsAttending ? "Green" : "Clear"}
          onPress={onToggleFriendsAttending}
        />
        <FilterChip
          text="Fits schedule"
          type="Display"
          color={fitsSchedule ? "Green" : "Clear"}
          onPress={onToggleFitsSchedule}
        />
        <FilterChip
          text="Popular"
          type="Display"
          color={popular ? "Green" : "Clear"}
          onPress={onTogglePopular}
        />
      </View>

      <View style={styles.section}>
        <Header4Text color={tokens.onBackground}>Time of day</Header4Text>
        <View style={styles.chipGrid}>
          {["Morning", "Afternoon", "Evening"].map((option) => {
            const value = option.toLowerCase();
            return (
              <FilterChip
                key={value}
                text={option}
                type="Display"
                color={timeOfDay === value ? "Green" : "Clear"}
                onPress={() => onSelectTimeOfDay(value)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Header4Text color={tokens.onBackground}>Visibility</Header4Text>
        <View style={styles.chipGrid}>
          {["Public", "Private"].map((option) => {
            const value = option.toLowerCase();
            return (
              <FilterChip
                key={value}
                text={option}
                type="Display"
                color={visibility === value ? "Green" : "Clear"}
                onPress={() => onSelectVisibility(value)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Header4Text color={tokens.onBackground}>Hosted by</Header4Text>
        <View style={styles.chipGrid}>
          {[
            { label: "Me", value: "me" },
            { label: "Friends", value: "friends" },
            { label: "Anyone", value: null },
          ].map(({ label, value }) => (
            <FilterChip
              key={label}
              text={label}
              type="Display"
              color={hostedBy === value ? "Green" : "Clear"}
              onPress={() => onSelectHostedBy(value)}
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
  firstChipGrid: {
    marginTop: 20,
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

export default EventsFilterSheet;
