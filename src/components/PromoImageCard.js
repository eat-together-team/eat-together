import React from "react";
import { StyleSheet, ImageBackground, Dimensions } from "react-native";
import Header3Text from "./typography/Header3Text";
import SubBodyText from "./typography/SubBodyText";
import OutlineArrowButton from "./OutlineArrowButton";

// Matches the page's 20px horizontal padding on both sides. Computed as an
// explicit pixel size (same approach as EventCard.js) rather than
// width:'100%' + aspectRatio — RN's Yoga layout doesn't reliably resolve a
// percentage width together with aspectRatio, which was leaving the card
// narrower than the content column with all the slack landing on one side.
export const PROMO_CARD_WIDTH = Dimensions.get("window").width - 40;
// A bit taller than the source images' native 157/352 ratio — the extra
// height just crops a little more of the (already blurred) background,
// which gives the text/button more breathing room.
export const PROMO_CARD_HEIGHT = PROMO_CARD_WIDTH * (180 / 352) - 13;

// Full-bleed promotional card on the Explore feed (Restaurant Picker,
// Dining Dollar Exchange) — a photo background (blur/dark-tint already
// baked into the provided image asset, so this only adds the corner
// radius) with a centered title, subtitle, and an OutlineArrowButton CTA.
const PromoImageCard = ({ image, title, subtitle, buttonLabel, onPress }) => {
  return (
    <ImageBackground source={image} style={styles.card} imageStyle={styles.image}>
      <Header3Text color="white" center style={styles.title}>
        {title}
      </Header3Text>
      <SubBodyText color="white" center style={styles.subtitle}>
        {subtitle}
      </SubBodyText>
      <OutlineArrowButton label={buttonLabel} onPress={onPress} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    width: PROMO_CARD_WIDTH,
    height: PROMO_CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    padding: 10,
  },
  image: {
    borderRadius: 12,
  },
  title: {
    // The content block is vertically centered as a group (title + subtitle
    // + button), which puts equal empty space above/below it — this nudges
    // the group up a bit so there's less of a gap specifically above the
    // title, without otherwise restructuring the centering.
    marginTop: -6,
  },
  subtitle: {
    paddingHorizontal: 10,
  },
});

export default PromoImageCard;
