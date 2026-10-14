import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../provider/Firebase";
import * as firebase from "firebase/compat";

const dbNameForEvent = (event) => (event.type === "public" ? "Public Events" : "Private Events");

const uploadEventPhoto = async (uri, event, user) => {
  const imageId = Date.now() + "_" + event.id;
  const response = await fetch(uri);
  const blob = await response.blob();
  const ref = storage.ref().child("eventGallery/" + event.id + "/" + imageId);
  await ref.put(blob);
  const imageUrl = await ref.getDownloadURL();

  const newImage = {
    imageUrl,
    imageId,
    imageUploadedTime: Date.now(),
    userUploaded: user.uid,
    eventId: event.id,
    imagePermissions: event.type,
    imageCaption: "Click the Add/Edit Button to insert a caption!",
    taggedUserIds: [],
  };

  await db.collection(dbNameForEvent(event)).doc(event.id).update({
    eventGallery: firebase.firestore.FieldValue.arrayUnion(newImage),
  });
};

// Shared "add a photo to this event's gallery" flow — used by both the
// Event view's "Add photo" tile and the Event photos gallery page's "+"
// action, so the picker/upload behavior stays identical between them.
export const pickAndUploadEventPhoto = (event, user) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Pick Image",
      "Choose an image for your event",
      [
        {
          text: "Gallery",
          onPress: async () => {
            try {
              await ImagePicker.requestMediaLibraryPermissionsAsync();
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
              });
              if (!result.canceled && result.assets?.[0]?.uri) {
                await uploadEventPhoto(result.assets[0].uri, event, user);
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        },
        {
          text: "Take a photo",
          onPress: async () => {
            try {
              await ImagePicker.requestCameraPermissionsAsync({});
              const result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.back,
                allowsEditing: true,
                quality: 1,
              });
              if (!result.canceled && result.assets?.[0]?.uri) {
                await uploadEventPhoto(result.assets[0].uri, event, user);
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  });
};
