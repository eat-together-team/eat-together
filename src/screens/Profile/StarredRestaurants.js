// Favorite restaurants — every restaurant a user has starred from the
// Restaurant Picker results (Users/{uid}.starredRestaurants), reached via
// the Favorite restaurants section's "View all" on Me.js/FullProfile.js.
// Mirrors Gallery.js/EventGallery.js's structure (live fetch, skeleton,
// Dialog-based removal confirmation) rather than the old grid/list-toggle +
// full restaurant-detail-modal version — that level of detail isn't part of
// this screen's design.

import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Layout, useTheme } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import CompactRestaurantCard from "../../components/CompactRestaurantCard";
import RestaurantCardSkeleton from "../../components/RestaurantCardSkeleton";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";

import { auth, db } from "../../provider/Firebase";
import firebase from "firebase/compat/app";
import { colorTokens } from "../../theme/colorTokens";

const SKELETON_COUNT = 4;

export default function StarredRestaurants({ route, navigation }) {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const ownerId = route.params?.userId || user?.uid;
  const isOwnProfile = ownerId === user?.uid;
  const title = isOwnProfile ? "My favorite restaurants" : "Favorite restaurants";

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    if (!ownerId) return;
    const unsubscribe = db.collection("Users").doc(ownerId).onSnapshot((doc) => {
      setRestaurants((doc.exists && doc.data().starredRestaurants) || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ownerId]);

  const handleBack = () => {
    if (!isOwnProfile && route.params?.person) {
      navigation.navigate("FullProfile", { person: route.params.person });
    } else {
      navigation.goBack();
    }
  };

  const confirmRemove = async () => {
    const restaurant = removeTarget;
    setRemoveTarget(null);
    const next = restaurants.filter((r) => String(r?.id) !== String(restaurant.id));

    try {
      await db.collection("Users").doc(user.uid).update({
        starredRestaurants: next,
        starredRestaurantIDs: next.map((r) => r?.id).filter(Boolean),
        starredRestaurantsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.log("Error removing favorite restaurant:", error);
    }
  };

  return (
    <Layout>
      <SmallAppBar title={title} onBack={handleBack} />

      {loading ? (
        <View style={styles.list}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <RestaurantCardSkeleton key={index} />
          ))}
        </View>
      ) : restaurants.length === 0 ? (
        <View style={styles.empty}>
          <Header4Text color={tokens.textNormal}>No favorites yet</Header4Text>
          <SubBodyText color={tokens.textMedium} center>
            {isOwnProfile
              ? "Add favorites from the Restaurant Picker to see them here."
              : "This user hasn't added any favorites yet."}
          </SubBodyText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {restaurants.map((restaurant) => (
            <CompactRestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              starred
              showActions={isOwnProfile}
              onToggleStar={() => setRemoveTarget(restaurant)}
            />
          ))}
        </ScrollView>
      )}

      <DialogOverlay visible={!!removeTarget} onDismiss={() => setRemoveTarget(null)}>
        <Dialog
          type="Destructive"
          title="Remove favorite?"
          primaryButtonText="Remove"
          secondaryButtonText="Cancel"
          onPrimaryPress={confirmRemove}
          onSecondaryPress={() => setRemoveTarget(null)}
        >
          {removeTarget && (
            <View style={{ width: "100%" }}>
              <CompactRestaurantCard restaurant={removeTarget} showActions={false} />
            </View>
          )}
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 10,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 40,
  },
});
