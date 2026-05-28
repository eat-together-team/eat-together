import React from "react";
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import NormalText from "./NormalText";
import SmallText from "./SmallText";

function getPrimaryCategory(categories) {
  const raw = typeof categories === "string" ? categories : "";
  if (!raw) return "";
  return raw.includes(",") ? raw.substring(0, raw.indexOf(",")) : raw;
}

const RestaurantsRow = props => {
  const restaurants = props.restaurants || [];

  if (restaurants.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scrollView}
    >
      {restaurants.map((r, index) => {
        const category = getPrimaryCategory(r.categories).trim();
        const subtitleParts = [];
        if (r.price) subtitleParts.push(r.price);
        if (r.rating) subtitleParts.push(`${r.rating}★`);
        if (category) subtitleParts.push(category);
        const subtitle = subtitleParts.join(" • ");

        return (
          <TouchableOpacity
            key={r.id || `${r.name || "restaurant"}-${index}`}
            style={styles.tileContainer}
            onPress={() => props.onRestaurantPress && props.onRestaurantPress(r)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={
                r.imageUrl ? { uri: r.imageUrl } : require("../../assets/foodBackground.png")
              }
              style={[styles.image, { width: 150, height: 150 }]}
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
                {!!subtitle && (
                  <SmallText style={styles.subtitle} color="white" numberOfLines={1}>
                    {subtitle}
                  </SmallText>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  tileContainer: {
    margin: 5,
    width: 150,
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
    padding: 10,
    paddingBottom: 8,
  },
  title: {
    textAlign: "left",
    width: "100%",
  },
  subtitle: {
    marginTop: 2,
    textAlign: "left",
    width: "100%",
  },
});

export default RestaurantsRow;

