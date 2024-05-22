import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Image, Alert, Dimensions } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import MediumText from "../../components/MediumText";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";

import { auth, db, storage } from "../../provider/Firebase";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";

import { getTimeOfDay, isAvailable, compareDates } from "../../methods";
import { auth, db } from "../../provider/Firebase";
import { Divider } from "react-native-elements";

export default function Gallery({ navigation }) {
    // Filters
    const [event, setEvent] = useState(false);
    const [newest, setNewest] = useState(false);
    const [oldest, setOldest] = useState(false);
    const [grid, setGrid] = useState(false);
    const [column, setColumn] = useState(false);

    const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

    const [filteredImages, setFilteredImages] = useState([]); // Filtered Images
    //Rendering filters
    return(
        <Layout >
            <View>
const numColumns = 3;
const tileSize = (Dimensions.get('window').width - 10) / numColumns - 10;

export default function Gallery({ route, navigation }) {
    const user = auth.currentUser;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const userDoc = await db.collection("Users").doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    setImages(userData.gallery || []);
                }
            } catch (error) {
                console.error("Error fetching images: ", error);
            } finally {
                setLoading(false);
            }
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
                    {
                        text: "Take a photo",
                        onPress: () => cameraImageSelector(imageId).then(resolve).catch(reject),
                    },
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
            await uploadImage(uri, imageId);
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
                await uploadImage(uri, imageId);
            }
        } catch (error) {
            alert("Error uploading message: " + error.message);
        }
    };

    const uploadImage = async (uri, imageId) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        let ref = storage.ref().child("Gallery/" + user.uid + '/' + imageId);
        await ref.put(blob);
        const path = await ref.getDownloadURL();
        const storeId = {
            imageUrl: path,
            imageId: imageId,
            imageUploadedTime: Date.now(),
            imageEventAssigned: '',
        };

        await db.collection("Users").doc(user.uid).update({
            gallery: firebase.firestore.FieldValue.arrayUnion(storeId),
        });

        setImages((prev) => [...prev, storeId]);
    };

    const addPhoto = async () => {
        const imageId = Date.now() + "_" + user.uid;
        await handleChoosePhoto(imageId)
            .then(() => {
                alert("Image Uploaded!");
                console.log("Image Uploaded!");
            })
            .catch((error) => {
                console.error("Image upload failed: ", error);
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
                <Button style={styles.button}> Add Photos </Button>
                <Divider></Divider>
                <MediumText style={{ paddingVertical: 10, paddingHorizontal: 10 }}>Sort By</MediumText>
            <HorizontalRow style={{ paddingHorizontal: 20 }}> 
                <Filter checked={event}
                onPress={() => setEvent(!event)} text="Event"/>
                <Filter checked={newest}
                onPress={() => setNewest(!event)} text="Newest"/>
                <Filter checked={oldest}
                onPress={() => setOldest(!oldest)} text="Oldest"/>
                <Filter checked={grid}
                onPress={() => setGrid(!grid)} text="Grid"/>
                <Filter checked={column}
                onPress={() => setGrid(!column)} text="Column"/>
            </HorizontalRow>
            </View>
        </Layout>
        );

    // For filters
    useEffect(() => { async function filter() {
      setLoading(true);
      let newImages = [...Images];

      if (newest) {
        newImages = filterByNewest(newEvents);
      }

      if (oldest) {
        newImages = filterByOldest(newEvents);
      }

      setFilteredImages(newImages);
    }

    if (images.length > 0) {
      filter().then(() => setLoading(false));
    }
  }, [
    events,
    newest, 
    oldest, 
    grid, 
    column
  ]);

  const filterByNewest = (newEvents) => {
    newImages = newImages.sort((a, b) => {
        return a.imageUploadedTime - b.imageUploadedTime;
    });
    return newImages;
  };

  const filterByOldest = (newEvents) => {
    newImages = newImages.sort((a, b) => {
        return b.imageUploadedTime - a.imageUploadedTime;
    });
    return newImages;
  };


            <View style={styles.buttonContainer}>
                <Button style={styles.button} onPress={addPhoto}> Add Photos </Button>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <LoadingView />
                ) : images.length > 0 ? (
                    <FlatList
                        data={images}
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
