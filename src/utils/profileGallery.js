import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../provider/Firebase";
import * as firebase from "firebase/compat";

const uploadGalleryPhoto = async (uri, user) => {
  const imageId = Date.now() + "_" + user.uid;
  const response = await fetch(uri);
  const blob = await response.blob();
  const ref = storage.ref().child("Gallery/" + user.uid + "/" + imageId);
  await ref.put(blob);
  const imageUrl = await ref.getDownloadURL();

  const newImage = {
    imageUrl,
    imageId,
    imageUploadedTime: Date.now(),
  };

  await db.collection("Users").doc(user.uid).update({
    gallery: firebase.firestore.FieldValue.arrayUnion(newImage),
  });
};

// Shared "add a photo to your profile gallery" flow — same
// pick-from-library-or-camera pattern as pickAndUploadEventPhoto
// (utils/eventGallery.js), just writing to Users/{uid}.gallery instead of an
// event's eventGallery.
export const pickAndUploadGalleryPhoto = (user) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Pick Image",
      "Choose an image for your gallery",
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
                await uploadGalleryPhoto(result.assets[0].uri, user);
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
                await uploadGalleryPhoto(result.assets[0].uri, user);
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
