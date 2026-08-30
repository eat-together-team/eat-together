import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Layout, useTheme } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import EventPhotoCard from "../../components/EventPhotoCard";
import EventGallerySkeleton from "../../components/EventGallerySkeleton";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";

import { auth, db, storage } from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import { pickAndUploadEventPhoto } from "../../utils/eventGallery";
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

  const canManage = event.hostID === user.uid || (event.attendees || []).includes(user.uid);

  useEffect(() => {
    const unsubscribe = db.collection(dbNameForEvent(event)).doc(event.id).onSnapshot((doc) => {
      const data = doc.data();
      setImageGallery((data && data.eventGallery) || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [event.id, event.type]);

  const handleAddPhoto = () => {
    pickAndUploadEventPhoto(event, user).catch((error) => {
      console.error("Image upload failed: ", error);
    });
  };

  const handleDeletePhoto = (photo) => {
    Alert.alert(
      "Delete this photo?",
      "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.ref().child(`eventGallery/${event.id}/${photo.imageId}`).delete();
              await db.collection(dbNameForEvent(event)).doc(event.id).update({
                eventGallery: firebase.firestore.FieldValue.arrayRemove(photo),
              });
            } catch (error) {
              console.error("Error deleting image: ", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
          {imageGallery.map((photo) => (
            <EventPhotoCard
              key={photo.imageId}
              photo={photo}
              onDelete={photo.userUploaded === user.uid ? () => handleDeletePhoto(photo) : undefined}
            />
          ))}
        </ScrollView>
      )}
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 40,
  },
});
