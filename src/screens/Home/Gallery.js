import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, FlatList, View, Image, Alert, Dimensions } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import { auth, db, storage } from "../../provider/Firebase";
import { Divider } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";
import NormalText from "../../components/NormalText";
import ImageContainer from "../../components/ImageContainer";
import LargeText from "../../components/LargeText";
import EventDropdown from "../../components/EventDropdown";

const gridColumns = 3;
const columnColumns = 1;
const tileSize = (Dimensions.get('window').width - 10) / gridColumns - 10;

export default function Gallery({ route, navigation }) {
    const user = auth.currentUser;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(false);
    const [newest, setNewest] = useState(false);
    const [oldest, setOldest] = useState(false);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [filteredImages, setFilteredImages] = useState([]);
    const showTypeRef = useRef();


    useEffect(() => {
        const fetchImages = async () => {
            try {
                const userDoc = await db.collection("Users").doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const fetchedImages = userData.gallery || [];
                    setImages(fetchedImages);
                    setFilteredImages(fetchedImages);
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
        setFilteredImages((prev) => [...prev, storeId]);
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


    const renderColumn = ({ item }) => {
        const uploadedTime = new Date(item.imageUploadedTime);
        const formattedDate = uploadedTime.toLocaleDateString(); // Display only the date
    
        return (
            <View style={styles.columnItem}>
                <MediumText>{formattedDate}</MediumText>
                <View style={{ width: tileSize, aspectRatio: 1 }}>
                    <Image style={{ width: '100%', height: '100%', borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                </View>
            </View>
        );
    };
                    
    const render1 = ({ item }) => {
        if (column) {
            return renderColumn({ item });
        } else {
            return (
                <View style={styles.imageItem}>
                    <Image style={{ width: tileSize, height: tileSize, borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                </View>
            );
        }
    };
    
    useEffect(() => {
        const filter = async () => {
            setLoading(true);
            let newImages = [...images];

            if (newest) {
                newImages = filterByNewest(newImages);
            }

            if (oldest) {
                newImages = filterByOldest(newImages);
            }

            setFilteredImages(newImages);
            setLoading(false);
        };

        if (images.length > 0) {
            filter();
        }
    }, [event, newest, oldest, grid, column, images]);

    const filterByNewest = (newImages) => {
        return newImages.sort((a, b) => b.imageUploadedTime - a.imageUploadedTime);
    };

    const filterByOldest = (newImages) => {
        return newImages.sort((a, b) => a.imageUploadedTime - b.imageUploadedTime);
    };

    return (
        <Layout>
            <TopNav
                middleContent={<MediumText>Your Photo Gallery</MediumText>}
                leftContent={<Ionicons name="chevron-back" size={20} />}
                leftAction={() => navigation.goBack()}
            />
            <View style={styles.buttonContainer}>
                <Button style={styles.button} onPress={addPhoto}> Add Photos </Button>
            </View>
            <View>
                <Divider />
                <MediumText style={{ paddingVertical: 10, paddingHorizontal: 10 }}>Sort By</MediumText>
                <HorizontalRow style={{ paddingHorizontal: 20 }}>
                    <Filter checked={event} onPress={() => setEvent(!event)} text="Event" />
                    <Filter checked={newest} onPress={() => { setNewest(true); setOldest(false); }} text="Newest" />
                    <Filter checked={oldest} onPress={() => { setOldest(true); setNewest(false); }} text="Oldest" />
                    <Filter checked={grid} onPress={() => { setGrid(true); setColumn(false); }} text="Grid" />
                    <Filter checked={column} onPress={() => { setColumn(true); setGrid(false); }} text="User" />
                </HorizontalRow>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <LoadingView />
                ) : filteredImages.length > 0 ? (
                    <FlatList
                        data={filteredImages}
                        renderItem={render1}
                        numColumns={column ? 1 : gridColumns}
                        key={column ? 'column' : 'grid'}
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
    columnItem: {
        marginVertical: 5,
        paddingRight: 80,
        width: '100%',
    },
    imageRow: {
        marginBottom: 10, 
    },
    
});
