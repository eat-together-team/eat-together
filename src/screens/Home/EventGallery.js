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

//Global variables
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2 * 5 * numColumns) / numColumns;


export default function EventGallery({ route, navigation }) {
    const user = auth.currentUser;
    const [event, setEvent] = useState(route.params.event);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [imageGallery, setImageGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);


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

    const deleteImage = async (imageUrl) => {
        try {
            const image = imageGallery.find(img => img.imageUrl === imageUrl);
            if (!image || image.userUploaded !== user.uid) {
                throw new Error("Unable to delete another attendee's photo.");
            }
    
            const toDelete = {
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                imageUploadedTime: image.imageUploadedTime,
                userUploaded: image.userUploaded,
                eventId: image.eventId,
                imagePermissions: image.imagePermissions,
            };
            
            let db_name = image.imagePermissions === "public" ? "Public Events" : "Private Events";
            await db.collection(db_name).doc(event.id).update({
                eventGallery: firebase.firestore.FieldValue.arrayRemove(toDelete),
            });
    
            const storageRef = storage.ref().child(`eventGallery/${event.id}/${image.imageId}`);
            await storageRef.delete();
    
            setImageGallery(prevImages => prevImages.filter(img => img.imageId !== image.imageId));
            alert("Image Deleted Successfully!")
    
        } catch (error) {
            alert("Error deleting image: " + error.message);
            console.error("Error deleting image: ", error);
        }
    };
    
    const handleDeleteImage = (imageUrl) => {
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
                        onPress: () =>{
                            deleteImage(imageUrl).then(resolve).catch(reject),
                            setIsModalVisible(false);

                        } 
                        
                    },
                ],
                { cancelable: false }
            );
        });
    };
    
    const getMetadata = async(uri) => {
        const image = imageGallery.find(item => item.imageUrl === uri);
        if (image) {
            const timeUploaded = new Date(image.imageUploadedTime).toLocaleString('en-US', { timeZoneName: 'short' });

            const userDoc = await db.collection("Users").doc(image.userUploaded).get();
            let uploadedBy = "Unknown User";
            if (userDoc.exists) {
                const userData = userDoc.data();
                uploadedBy = `${userData.firstName} ${userData.lastName}`;
            }

            Alert.alert(
                " Image Information",
                `Upload date and time: ${timeUploaded}\n\nUser who uploaded it: ${uploadedBy}`
            );
        } 
    };

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
        const screenWidth = Dimensions.get("window").width;
        const tileSize = (screenWidth - 2 * 5 * numColumns) / numColumns;
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
        const screenWidth = Dimensions.get("window").width;
        const tileSize = (screenWidth - 2 * 5 * numColumns) / numColumns;
    
        if (column) {
            return renderColumn({ item });
        } else {
            return (
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={[styles.imageItem, { width: tileSize, height: tileSize }]}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 15 }} source={{ uri: item.imageUrl }} />
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
                        contentContainerStyle={[styles.flatListContentContainer, { alignItems: column ? 'flex-start' : 'flex-start' }]}
                        key={column ? 'column' : 'grid'}
                        ListFooterComponent={() => {
                            // Calculate the number of empty placeholder items needed
                            const emptyItemsCount = numColumns - (imageGallery.length-1 % numColumns);
                            if (emptyItemsCount === numColumns || column) return null; // If it's the last row or column view, no need for empty items
                            return Array.from(Array(emptyItemsCount).keys()).map((index) => (
                                <View key={index} style={[styles.imageItem, { width: tileSize, height: tileSize }]} />
                            ));
                        }}
                    />
                ) : (
                    <EmptyState title="No Images" text="Add some photos to your event gallery!" />
                )}
            </View>
            <Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
            <   View style={styles.modalTop}>
                    <TouchableWithoutFeedback onPress={handleCloseModal}>
                    <Ionicons name="chevron-back" size={20} />
                    </TouchableWithoutFeedback>
                    
                </View>

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
                        <Ionicons name="trash" style={{ fontSize: 25, textAlign: "right", marginEnd: 5 }} onPress={() => handleDeleteImage(selectedImageUri)} />
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
        alignItems: "left",
        justifyContent: "flex-start", // Change justifyContent to flex-start
    },
    imageItem: {
        width: tileSize,
        height: tileSize,
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
        alignItems: 'flex-start', // Align items to the flex-start
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
    modalTop: {
        height: 75,
        backgroundColor: "white",
        flexDirection: 'row',
        alignItems: 'center',
        padding:20,
    },

});
