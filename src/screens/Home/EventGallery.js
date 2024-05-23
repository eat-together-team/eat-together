import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Alert, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import Filter from "../../components/Filter";
import HorizontalRow from "../../components/HorizontalRow";
import { auth, db, storage } from "../../provider/Firebase";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";
import NormalText from "../../components/NormalText";

export default function EventGallery({ route, navigation }) {
    const user = auth.currentUser;
    const [event, setEvent] = useState(route.params.event);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [imageGallery, setImageGallery] = useState([]);
    const [eventType, seteventType] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    const screenWidth = Dimensions.get("window").width;
    const numColumns = 3;
    const tileSize = (screenWidth - 2 * 5 * numColumns) / numColumns; // Adjusted to account for margins

    useEffect(() => {
        const fetchImages = async () => {
            let db_name = event.type === "public" ? "Public Events" : "Private Events";
            const eventDoc = await db.collection(db_name).doc(event.id).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                if (eventData && eventData.eventGallery && Array.isArray(eventData.eventGallery)) {
                    setImageGallery(eventData.eventGallery);
                }
            }
            setLoading(false);
        };
        fetchImages();
    }, [event.id, event.type]);

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
            imagePermissions:event.type,
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
            navigation.goBack();
        })
        .catch((error) => {
            console.error("Image upload failed: ", error);
        });
    };

    const deleteImage = async () => {
        const image = imageGallery.find(item => item.imageUrl === uri);
        if (image) {
            const timeUploaded = new Date(image.imageUploadedTime).toLocaleString('en-US', { timeZoneName: 'short' });
            console.log(timeUploaded)
            console.log("Event ID:", image.eventId);
            console.log("Image Permissions:",image.imagePermissions);
            const userDoc = await db.collection("Users").doc(image.userUploaded).get();
            let uploadedBy = "Unknown User";
            if (userDoc.exists) {
                const userData = userDoc.data();
                uploadedBy = `${userData.firstName} ${userData.lastName}`;
            }
            console.log("Uploaded By:", uploadedBy);

            // Add more metadata fields if needed
            let db_name = image.imagePermissions === "public" ? "Public Events" : "Private Events";
            const eventDoc = await db.collection(db_name).doc(image.eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                if (eventData && eventData.eventGallery && Array.isArray(eventData.eventGallery)) {
                    Alert.alert(
                        " Image Information","Upload date and time"+ "\n\n"+
                            timeUploaded
                        + "\n\nUser who uploaded it\n\n" + uploadedBy,
                        
                    );
        
                }
            }

        } 


    };
    const getMetadata = async(uri) => {
        const image = imageGallery.find(item => item.imageUrl === uri);
        if (image) {
            const timeUploaded = new Date(image.imageUploadedTime).toLocaleString('en-US', { timeZoneName: 'short' });
            console.log(timeUploaded)
            console.log("Event ID:", image.eventId);
            console.log("Image Permissions:",image.imagePermissions);
            const userDoc = await db.collection("Users").doc(image.userUploaded).get();
            let uploadedBy = "Unknown User";
            if (userDoc.exists) {
                const userData = userDoc.data();
                uploadedBy = `${userData.firstName} ${userData.lastName}`;
            }
            console.log("Uploaded By:", uploadedBy);

            // Add more metadata fields if needed
            let db_name = image.imagePermissions === "public" ? "Public Events" : "Private Events";
            const eventDoc = await db.collection(db_name).doc(image.eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                if (eventData && eventData.eventGallery && Array.isArray(eventData.eventGallery)) {
                    Alert.alert(
                        " Image Information","Upload date and time"+ "\n\n"+
                            timeUploaded
                        + "\n\nUser who uploaded it\n\n" + uploadedBy,
                        
                    );
        
                }
            }

        } 
            

    }


    const UserName = ({ userId }) => {
        const [userName, setUserName] = useState("");

        useEffect(() => {
            const fetchUserName = async () => {
                const userDoc = await db.collection("Users").doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    setUserName(`${userData.firstName} ${userData.lastName}`);
                } else {
                    setUserName("Unknown User");
                }
            };
            fetchUserName();
        }, [userId]);

        return <MediumText>{userName}</MediumText>;
    };

    const renderColumn = ({ item }) => {
        return (
            <View style={styles.columnItem}>
                <UserName userId={item.userUploaded} />
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={{ width: tileSize, aspectRatio: 1 }}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderImage = ({ item }) => {
        if (column) {
            return renderColumn({ item });
        } else {
            return (
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={styles.imageItem}>
                        <Image style={{ width: tileSize, height: tileSize, borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            );
        }
    };

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

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
            <HorizontalRow style={{ paddingHorizontal: 20 }}>
                <Filter checked={grid} onPress={() => { setGrid(true); setColumn(false); }} text="Grid" />
                <Filter checked={column} onPress={() => { setColumn(true); setGrid(false); }} text="Sort By User" />
            </HorizontalRow>

            <View style={styles.container}>
                {loading ? (
                    <LoadingView />
                ) : imageGallery.length > 0 ? (
                    <FlatList
                        data={imageGallery}
                        renderItem={renderImage}
                        numColumns={column ? 1 : numColumns}
                        keyExtractor={(item) => item.imageId}
                        contentContainerStyle={styles.flatListContentContainer}
                        key={column ? 'column' : 'grid'}
                    />
                ) : (
                    <EmptyState title="No Images" text="Add some photos to your event gallery!" />
                )}
            </View>
            <Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
                <TouchableWithoutFeedback onPress={handleCloseModal}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={{ uri: selectedImageUri }} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.modalBottom}>
                    <TouchableOpacity>
                        <Ionicons name="information-circle" style={{ fontSize: 25, textAlign: "right", marginEnd: 10 }} onPress={() => getMetadata(selectedImageUri)} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="trash" style={{ fontSize: 25, textAlign: "right", marginEnd: 5 }} onPress={deleteImage} />
                    </TouchableOpacity>
                </View>
            </Modal>
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
    imageItem: {
        margin: 5,
    },
    columnItem: {
        marginVertical: 5,
        width: '100%',
        alignItems: 'flex-start',
    },
    flatListContentContainer: {
        justifyContent: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 5,
    },
    imageRow: {
        marginBottom: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "50%",
        height: "50%",
        aspectRatio: 1,
    },
    modalBottom: {
        height: 49,
        backgroundColor: "white",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 5,
        flexDirection: 'row',
    },
});
