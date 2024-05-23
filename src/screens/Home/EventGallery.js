import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Alert, Dimensions, Image } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";

import { auth, db, storage } from "../../provider/Firebase";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";

export default function EventGallery({ route, navigation }) {
    const user = auth.currentUser;
    const [event, setEvent] = useState(route.params.event);
    const [imageGallery, setImageGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const screenWidth = Dimensions.get("window").width;
    const numColumns = 3;
    const tileSize = (screenWidth - 46) / numColumns;

    useEffect(() => {
        const fetchImages = async () => {
            let db_name = event.type === "public" ? "Public Events" : "Private Events";
            const eventDoc = await db.collection(db_name).doc(event.id).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                console.log('Event Data:', eventData);  // Log event data
                if (eventData && eventData.eventGallery && Array.isArray(eventData.eventGallery)) {
                    setImageGallery(eventData.eventGallery);
                    console.log('Image Gallery:', eventData.eventGallery);  // Log image gallery
                }
            }
            setLoading(false);
        };
        fetchImages();
    }, []);

    const handleChoosePhoto = (imageId) => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                "Pick Image",
                "Choose an image for your event",
                [
                    {
                        text: "Gallery",
                        onPress: () => galleryImageSelector(imageId).then(resolve).catch(reject),
                    },
                    { text: "Take a photo", onPress: () => cameraImageSelector(imageId).then(resolve).catch(reject) },
                ],
                { cancelable: false }
            );
        });
    };

    const galleryImageSelector = async (imageId) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.cancelled) {
            const uri = result.assets[0].uri;
            await storeImage(uri, imageId);
        }
    };

    const cameraImageSelector = async (imageId) => {
        try {
            await ImagePicker.requestCameraPermissionsAsync({});
            let result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.back,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.cancelled) {
                const uri = result.assets[0].uri;
                await storeImage(uri, imageId);
            }
        } catch (error) {
            alert("Error uploading message: " + error.message);
        }
    };

    const storeImage = async (uri, imageId) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        let ref = storage.ref().child("eventGallery/" + event.id + '/' + imageId);
        await ref.put(blob);
        const path = await ref.getDownloadURL();

        const newImage = {
            imageUrl: path,
            imageId: imageId,
            imageUploadedTime: Date.now(),
            userUploaded: user.uid,
            eventId: event.id,
        };

        let db_name = event.type === "public" ? "Public Events" : "Private Events";
        await db.collection(db_name).doc(event.id).update({
            eventGallery: firebase.firestore.FieldValue.arrayUnion(newImage),
        });

        setImageGallery((prev) => [...prev, newImage]);
    };

    const addImage = async () => {
        const imageId = Date.now() + "_" + event.id;
        await handleChoosePhoto(imageId).then(() => {
            alert("Image Uploaded!");
            console.log("Image Uploaded!");
            navigation.goBack();
        })
        .catch((error) => {
            console.error("Image upload failed: ", error);
        });
    };

    // Deletes gallery image from Firebase Storage
    const deleteImage = async (image_id) => {
        try {
            const [eventId, setEventId] = useState("");
            const [imageId, setImageId] = useState("");
            const [imageUploadedTime, setImageUploadedTime] = useState("");
            const [imageUrl, setImageUrl] = useState("");
            useEffect(() => {
                db.collection("Users").doc(user.uid).onSnapshot((doc) => {
                    if (doc.exists) {
                        doc.data().gallery.forEach((image) => {
                            if (image.imageID === image_id) {
                                if (image.userUploaded == user.uid) {
                                    setEventId(image.eventId);
                                    setImageId(image.imageId);
                                    setImageUploadedTime(image.imageUploadedTime);
                                    setImageUrl(image.imageUrl);
                                    return;
                                } else {
                                    throw Error("Unable to delete another attendee's photo.");
                                }
                            }
                        });
                    }
                });
            }, []);
            
            const toDelete = {
                eventId: eventId,
                imageId: imageId,
                imageUploadedTime: imageUploadedTime,
                imageUrl: imageUrl
            };
            
            // Remove image from gallery
            db.collection("Users").doc(user.uid).update({
                    gallery: firebase.firestore.FieldValue.arrayRemove(toDelete)
            });
            
            // Delete from storage
            // TODO: update to take in Gallery or eventGallery
            await storage.bucket().file(`Gallery/${imageID}`).delete();

        } catch (error) {
            alert("Error deleting message: " + error.message);
        }
    }

    const handleDeleteImage = (imageId) => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                "Are you sure?",
                "Deleting your image cannot be reversed. Are you sure you want to continue?",
                [
                    {
                        text: "No",
                        onPress: () => {},
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: () => deleteImage(imageId).then(resolve).catch(reject),
                    },
                ],
                { cancelable: false }
            );
        });
    };

    const renderImage = ({ item }) => (
        <View style={styles.imageItem}>
            <Image style={{ width: tileSize, height: tileSize, borderRadius: 15 }} source={{ uri: item.imageUrl }} />
        </View>
    );

    return (
        <Layout>
            <TopNav
                middleContent={<MediumText>Event Photo Gallery</MediumText>}
                leftContent={<Ionicons name="chevron-back" size={20} />}
                leftAction={() => navigation.goBack()}
            />
            <View style={styles.buttonContainer}>
                <Button style={styles.button} onPress={addImage}> Add Photos </Button>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <LoadingView />
                ) : imageGallery.length > 0 ? (
                    <FlatList
                        data={imageGallery}
                        renderItem={renderImage}
                        numColumns={numColumns}
                        keyExtractor={(item) => item.imageId}
                        contentContainerStyle={styles.flatListContentContainer}
                    />
                ) : (
                    <EmptyState title="No Images" text="Add some photos to your event gallery!" />
                )}
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    button: {
        width: "80%",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    flatListContentContainer: {
        justifyContent: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 5,
    },
    imageItem: {
        margin: 5,
    },
});
