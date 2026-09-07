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
import { pickAndUploadEventPhoto } from "../../utils/eventGallery";
import { fetchPeopleByIds } from "../../utils/fetchPeopleByIds";
import { colorTokens } from "../../theme/colorTokens";

const dbNameForEvent = (event) => (event.type === "public" ? "Public Events" : "Private Events");

// Event photos gallery — a 2-column grid of every photo added to this
// event. Tapping a card to view it full-size isn't wired up yet; this only
// covers the grid itself (view-only, attending-with-delete, and loading).
export default function EventGallery({ route, navigation }) {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [event] = useState(route.params.event);
  const [imageGallery, setImageGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [taggedPeopleById, setTaggedPeopleById] = useState({});

  const canManage = event.hostID === user.uid || (event.attendees || []).includes(user.uid);

  useEffect(() => {
    const unsubscribe = db.collection(dbNameForEvent(event)).doc(event.id).onSnapshot((doc) => {
      const data = doc.data();
      setImageGallery((data && data.eventGallery) || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [event.id, event.type]);

  // Small avatars for tagged people are shown on each grid card — fetched
  // once per unique tagged id across the whole gallery (rather than per
  // card) so re-tagging one photo doesn't refetch everyone else's.
  useEffect(() => {
    const allTaggedIds = [...new Set(imageGallery.flatMap((photo) => photo.taggedUserIds || []))];
    const missingIds = allTaggedIds.filter((id) => !taggedPeopleById[id]);
    if (missingIds.length === 0) return;

    fetchPeopleByIds(missingIds).then((people) => {
      setTaggedPeopleById((prev) => {
        const next = { ...prev };
        people.forEach((person) => {
          next[person.id] = person;
        });
        return next;
      });
    });
  }, [imageGallery]);

  const handleAddPhoto = () => {
    pickAndUploadEventPhoto(event, user).catch((error) => {
      console.error("Image upload failed: ", error);
      Alert.alert("Couldn't add photo", error.message || "Please try again.");
    });
  };

  const handleDeletePhoto = (photo) => setDeleteTarget(photo);

  const confirmDeletePhoto = async () => {
    const photo = deleteTarget;
    setDeleteTarget(null);
    try {
      await storage.ref().child(`eventGallery/${event.id}/${photo.imageId}`).delete();
      await db.collection(dbNameForEvent(event)).doc(event.id).update({
        eventGallery: firebase.firestore.FieldValue.arrayRemove(photo),
      });
    } catch (error) {
      console.error("Error deleting image: ", error);
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title="Event photos"
        onBack={() => navigation.goBack()}
        actions={canManage ? [{ icon: "add", onPress: handleAddPhoto }] : []}
      />

      {loading ? (
        <EventGallerySkeleton />
      ) : imageGallery.length === 0 ? (
        <View style={styles.empty}>
          <Header4Text color={tokens.textNormal}>No photos yet</Header4Text>
          <SubBodyText color={tokens.textMedium}>
            {canManage ? "Add the first one from here or the event page." : "Check back once someone adds one."}
          </SubBodyText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {imageGallery.map((photo, photoIndex) => (
            <EventPhotoCard
              key={photo.imageId}
              photo={photo}
              taggedPeople={(photo.taggedUserIds || []).map((id) => taggedPeopleById[id]).filter(Boolean)}
              onPress={() =>
                navigation.navigate("EventPhotoViewer", { photos: imageGallery, initialIndex: photoIndex, event })
              }
              onDelete={photo.userUploaded === user.uid ? () => handleDeletePhoto(photo) : undefined}
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
