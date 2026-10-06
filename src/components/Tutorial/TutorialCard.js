// The green (primary/primaryContainer) card holding a tutorial step's copy
// and Back/Next controls. Floats just above (anchor="bottom") or below
// (anchor="top") the measured target rect — it must never overlap the
// target, since the target is shown through a hole punched in
// TutorialSpotlight's scrim, and an overlapping opaque card would cover
// that hole right back up.
//
// `target` may be null (its measurement hasn't resolved yet, or never
// does) — the card still renders at a reasonable fallback position rather
// than disappearing, since it's the only way to move forward or back.

import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import Header2Text from "../typography/Header2Text";
import BodyText from "../typography/BodyText";
import LargeButton from "../LargeButton";

const TARGET_GAP = 20;
const EDGE_MARGIN = 20;
// Where the card sits when it doesn't (yet, or ever) have a real target to
// anchor to — roughly clears the app bar / bottom tab bar in either case.
const FALLBACK_TOP_OFFSET = 90;
const FALLBACK_BOTTOM_OFFSET = 110;

const TutorialCard = ({
  anchor,
  target,
  title,
  body,
  stepIndex,
  stepCount,
  onBack,
  onNext,
  nextLabel = "Next",
}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get("window");

  const panelColor = theme === "dark" ? colors.primaryContainer : colors.primary;
  const textColor = theme === "dark" ? colors.onPrimaryContainer : colors.onPrimary;

  const positionStyle = anchor === "top"
    ? {
        top: target
          ? Math.max(target.y + target.height + TARGET_GAP, insets.top + EDGE_MARGIN)
          : insets.top + FALLBACK_TOP_OFFSET,
      }
    : {
        bottom: target
          ? Math.max(screenHeight - target.y + TARGET_GAP, insets.bottom + EDGE_MARGIN)
          : insets.bottom + FALLBACK_BOTTOM_OFFSET,
      };

  return (
    <View style={[styles.card, { backgroundColor: panelColor }, positionStyle]}>
      <View style={styles.dots}>
        {Array.from({ length: stepCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: textColor, opacity: index === stepIndex ? 1 : 0.35 },
            ]}
          />
        ))}
      </View>

      <Header2Text color={textColor} style={styles.title}>{title}</Header2Text>
      <BodyText color={textColor} style={styles.body}>{body}</BodyText>

      <View style={styles.buttons}>
        {onBack && (
          <View style={styles.buttonFlex}>
            <LargeButton outlined color={textColor} onPress={onBack}>Back</LargeButton>
          </View>
        )}
        <View style={styles.buttonFlex}>
          <LargeButton
            color={colors.onPrimary}
            textColor={panelColor}
            onPress={onNext}
          >
            {nextLabel}
          </LargeButton>
        </View>
      </View>
    </View>
  );
};

export default TutorialCard;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: EDGE_MARGIN,
    right: EDGE_MARGIN,
    borderRadius: radiusTokens.extraLarge,
    padding: 20,
    zIndex: 2,
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    marginBottom: 6,
  },
  body: {
    marginBottom: 18,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  buttonFlex: {
    flex: 1,
  },
});
