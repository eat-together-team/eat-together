// Profile gallery — a 2-column grid of every photo in a user's own gallery
// (Users/{uid}.gallery), reached via the Gallery section's "View all" on
// Me.js/FullProfile.js. Mirrors EventGallery.js's structure closely (same
// grid card, skeleton, and delete-confirmation dialog), just sourced from a
// user doc instead of an event doc, and with no tagging/captions/event
// assignment — none of that is part of this screen's design.

import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import { Layout, useTheme } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import EventPhotoCard from "../../components/EventPhotoCard";
import EventGallerySkeleton from "../../components/EventGallerySkeleton";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";
import { radiusTokens } from "../../theme/radiusTokens";

import { auth, db, storage } from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import { pickAndUploadGalleryPhoto } from "../../utils/profileGallery";
import { colorTokens } from "../../theme/colorTokens";

export default function Gallery({ route, navigation }) {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const galleryOwnerId = route.params?.userId || user?.uid;
  const viewingUserName = route.params?.userName || "";
  const isOwnGallery = galleryOwnerId === user?.uid;
  const title = isOwnGallery ? "My gallery" : viewingUserName ? `${viewingUserName}'s gallery` : "Gallery";

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!galleryOwnerId) return;
    const unsubscribe = db.collection("Users").doc(galleryOwnerId).onSnapshot((doc) => {
      setImages((doc.exists && doc.data().gallery) || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [galleryOwnerId]);

  const handleBack = () => {
    if (!isOwnGallery && route.params?.person) {
      navigation.navigate("FullProfile", { person: route.params.person });
    } else {
      navigation.goBack();
    }
  };

  const handleAddPhoto = () => {
    pickAndUploadGalleryPhoto(user).catch((error) => {
      console.error("Image upload failed: ", error);
      Alert.alert("Couldn't add photo", error.message || "Please try again.");
    });
  };

  const handleDeletePhoto = (photo) => setDeleteTarget(photo);

  const confirmDeletePhoto = async () => {
    const photo = deleteTarget;
    setDeleteTarget(null);
    try {
      await storage.ref().child(`Gallery/${galleryOwnerId}/${photo.imageId}`).delete();
      await db.collection("Users").doc(galleryOwnerId).update({
        gallery: firebase.firestore.FieldValue.arrayRemove(photo),
      });
    } catch (error) {
      console.error("Error deleting image: ", error);
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title={title}
        onBack={handleBack}
        actions={isOwnGallery ? [{ icon: "add", onPress: handleAddPhoto }] : []}
      />

      {loading ? (
        <EventGallerySkeleton />
      ) : images.length === 0 ? (
        <View style={styles.empty}>
          <Header4Text color={tokens.textNormal}>No photos yet</Header4Text>
          <SubBodyText color={tokens.textMedium}>
            {isOwnGallery ? "Add the first one from here." : "Check back once they add one."}
          </SubBodyText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {images.map((photo, photoIndex) => (
            <EventPhotoCard
              key={photo.imageId}
              photo={photo}
              onPress={() =>
                navigation.navigate("GalleryPhotoViewer", {
                  photos: images,
                  initialIndex: photoIndex,
                  ownerId: galleryOwnerId,
                })
              }
              onDelete={isOwnGallery ? () => handleDeletePhoto(photo) : undefined}
            />
          ))}
        </ScrollView>
      )}

      <DialogOverlay visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
        <Dialog
          type="Destructive"
          title="Remove image?"
          primaryButtonText="Remove"
          secondaryButtonText="Cancel"
          onPrimaryPress={confirmDeletePhoto}
          onSecondaryPress={() => setDeleteTarget(null)}
        >
          {deleteTarget && (
            <Image source={{ uri: deleteTarget.imageUrl }} contentFit="cover" style={styles.previewImage} />
          )}
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  previewImage: {
    width: "100%",
    height: 253,
    borderRadius: radiusTokens.small,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 40,
  },
});
