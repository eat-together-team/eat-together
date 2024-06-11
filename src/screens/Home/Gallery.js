import React, { useEffect, useState,} from "react";
import { StyleSheet, FlatList, View, Image, Alert, Dimensions, Modal, TouchableOpacity, TouchableWithoutFeedback, Text } from "react-native";
import { Layout, TopNav,} from "react-native-rapi-ui";
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
import LargeText from "../../components/LargeText";

//Global variables
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2 * 5 * numColumns) / numColumns;

export default function Gallery({ route, navigation }) {
    //State Variables
    const user = auth.currentUser;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(false);
    const [newest, setNewest] = useState(false);
    const [oldest, setOldest] = useState(false);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [filteredImages, setFilteredImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [attendedEventNames, setAttendedEventNames] = useState([]);
    const [isEventModalVisible, setIsEventModalVisible] = useState(false);
    const [selectedImageForEvent, setSelectedImageForEvent] = useState(null);

    // Use Effect to fetch image data
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

    // Use effect to fetch attended events of the user

    useEffect(() => {
        const fetchAttendedEvents = async () => {
            try {
                const userDoc = await db.collection("Users").doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const attendedEventsData = userData.attendedEventIDs || [];
                    setAttendedEvents(attendedEventsData);


                }
            } catch (error) {
                console.error("Error fetching attended events: ", error);
            }
        };

        fetchAttendedEvents();
    }, []);
    
    // Use effect to fetch event names

    useEffect(() => {
        const fetchEventNames = async () => {
            const names = await Promise.all(attendedEvents.map(async (event) => {
                let eventName = 'Unknown Event';
                const eventId = event.id;
                try {
                    let eventDoc;
                    if (event.type === 'public') {
                        eventDoc = await db.collection("Public Events").doc(eventId).get();
                    } else if (event.type === 'private') {
                        eventDoc = await db.collection("Private Events").doc(eventId).get();
                    }
                    if (eventDoc.exists) {
                        eventName = eventDoc.data().name;
                    }
                } catch (error) {
                    console.error("Error fetching event details: ", error);
                }
                return eventName;
            }));
            setAttendedEventNames(names);
        };

        fetchEventNames();
    }, [attendedEvents]);


    // Choosing images from gallery or taking a picture

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

    // Uses image picker to select images from gallery

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

    // Uses image picker to take an image

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

    // Stores images in the storage and image reference in firestore

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
                navigation.goBack();
            })
            .catch((error) => {
                console.error("Image upload failed: ", error);
            });
    };

    // Function to delete images from database

    const deleteImage = async (imageUrl) => {
        try {
            const image = images.find(img => img.imageUrl === imageUrl);
    
            const toDelete = {
                imageEventAssigned:image.imageEventAssigned,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                imageUploadedTime: image.imageUploadedTime,
            };
            
            
            await db.collection("Users").doc(user.uid).update({
                gallery: firebase.firestore.FieldValue.arrayRemove(toDelete),
            });
    
            const storageRef = storage.ref().child(`Gallery/${user.uid}/${image.imageId}`);
            await storageRef.delete();
    
            setImages(prevImages => prevImages.filter(img => img.imageId !== image.imageId));
            alert("Image Deleted Successfully!")
    
            console.log("Image deleted successfully");
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
                            deleteImage(imageUrl).then(resolve).catch(reject)
                            setIsModalVisible(false);
                        } 
                        
                    },
                ],
                {                
                    cancelable: false
                }
            );
        });
    };

    // Renders column view

    const renderColumn = ({ item }) => {
        const uploadedTime = new Date(item.imageUploadedTime);
        const formattedDate = uploadedTime.toLocaleDateString();

        return (
            <View style={styles.columnItem}>
                <MediumText>{formattedDate}</MediumText>
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: item.imageUrl }} />
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
                    <View style={[styles.imageItem, { width: tileSize, height: tileSize }]}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            );
        }
    };

    // retreives metadata from firestore

    const getMetadata = async (uri) => {
        const image = images.find(item => item.imageUrl === uri);
        if (image) {
            const timeUploaded = new Date(image.imageUploadedTime).toLocaleString('en-US', { timeZoneName: 'short' });
            let eventName = '';
    
            try {
                // Check if the event ID exists in the Public Events collection
                const publicEventDoc = await db.collection("Public Events").doc(image.imageEventAssigned).get();
                console.log("Public Events:",publicEventDoc.exists)
                if (publicEventDoc.exists) {
                    eventName = publicEventDoc.data().name;
                    console.log(eventName)
                } else {
                    // If not found in Public Events, check Private Events collection
                    const privateEventDoc = await db.collection("Private Events").doc(image.imageEventAssigned).get();
                    console.log("Private Events:",privateEventDoc)
                    if (privateEventDoc.exists) {
                        eventName = privateEventDoc.data().name;
                    } else {
                        // If event ID not found in either collection
                        eventName = 'Unknown Event';
                    }
                }
            } catch (error) {
                console.error("Error fetching event details: ", error);
                eventName = 'Unknown Event';
            }
    
            Alert.alert(
                " Image Information",
                `Upload date and time: ${timeUploaded}\n\n Event Assigned: ${eventName}`
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

    const handleAssignEvent = (uri) => {
        setSelectedImageForEvent(uri);
        setIsEventModalVisible(true);
    };
    const handleEventSelect = (eventId) => {
        console.log("Selected Event ID:", eventId);
        if (selectedImageForEvent) {
            assignImageToEvent(eventId);
            setIsEventModalVisible(false);

        } else {
            console.error("No image selected for event assignment.");
        }
        };
        
                    
    const assignImageToEvent = async (eventId) => {
        try {
            // Find the index of the image in the gallery array
            console.log("Images", images);
            const imageIndex = images.findIndex(img => img.imageUrl === selectedImageUri);
            console.log("Image Index:", imageIndex);
            if (imageIndex !== -1) {
                // Update the image's event assignment
                const updatedImages = [...images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    imageEventAssigned: eventId,
                };
                console.log("Updated Images", updatedImages);
                // Update the user document with the modified gallery array
                await db.collection("Users").doc(user.uid).update({
                    gallery: updatedImages,
                });
    
                // Update the state or do any necessary actions after assigning the image to the event
                setImages(updatedImages);
                setIsModalVisible(false);
                alert("Image assigned to event successfully!");
            } else {
                // Handle the case where the image is not found
                console.error("Image not found in the gallery.");
            }
        } catch (error) {
            console.error("Error assigning image to event: ", error);
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
                    <Filter checked={newest} onPress={() => { setNewest(true); setOldest(false); }} text="Newest" />
                    <Filter checked={oldest} onPress={() => { setOldest(true); setNewest(false); }} text="Oldest" />
                    <Filter checked={grid} onPress={() => { setGrid(true); setColumn(false); }} text="Grid" />
                    <Filter checked={column} onPress={() => { setColumn(true); setGrid(false); }} text="Date" />
                </HorizontalRow>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <LoadingView />
                ) : filteredImages.length > 0 ? (
                    <FlatList
                        data={filteredImages}
                        renderItem={renderImage}
                        numColumns={grid ? numColumns : 1}
                        key={grid ? 'grid' : 'column'}
                        keyExtractor={(item) => item.imageId}
                        contentContainerStyle={styles.flatListContentContainer}
                    />
                ) : (                    <EmptyState title="No Images" text="Add some photos to your event gallery!" />
                )}
            </View>
            <Modal visible={isEventModalVisible} transparent={true} onRequestClose={() => setIsEventModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setIsEventModalVisible(false)}>
                    <View style={modalStyles.modalBackground}>
                        <View style={modalStyles.modalContainer}>
                            <LargeText style={modalStyles.eventText}>Select an Event</LargeText>
                            <View style={modalStyles.eventItem}>
                            <FlatList
                                data={attendedEvents}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => handleEventSelect(item.id)}>
                                        <View style={modalStyles.eventItem}>
                                            <Text style={modalStyles.eventText}>{attendedEventNames[index] || 'Unknown Event'}</Text>
                                        </View>
                                    </TouchableOpacity>

                                )}
                            />

                            </View>


                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            <Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
                <TouchableWithoutFeedback onPress={handleCloseModal}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={{ uri: selectedImageUri }} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.modalBottom}>
                    <TouchableOpacity style={styles.leftIcons} onPress={() => handleAssignEvent(selectedImageUri)}>
                        <NormalText style={{ color: '#5db075', fontSize: 20, fontWeight: 'bold' }}> Assign Images to an Event </NormalText>
                    </TouchableOpacity>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity>
                            <Ionicons name="information-circle" style={{ fontSize: 25, textAlign: "right", marginEnd: 10 }} onPress={() => getMetadata(selectedImageUri)} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="trash" style={styles.icon} onPress={() => handleDeleteImage(selectedImageUri)} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Layout>
    );
}
// Styles for the screen
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
        justifyContent: "flex-start",
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
        paddingHorizontal: 5,
        alignItems: 'flex-start',
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "85%",
        height: "65%",
        aspectRatio: 1,
    },
    modalBottom: {
        height: 49,
        backgroundColor: "white",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftIcons: {
        flexDirection: 'row',
    },
    rightIcons: {
        flexDirection: 'row',
    },
    icon: {
        fontSize: 25,
        marginRight: 10,
    },
    imageContainer: {
        width: tileSize,
        aspectRatio: 1,
        marginVertical: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    eventItem: {
        padding: 15,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    

});

// Styles for the Assign image to an event modal

const modalStyles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "85%",
        maxHeight: "65%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
    },
    eventItem: {
        padding: 15,
        borderBottomColor: '#fff',
        borderBottomWidth: 1,
    },
    eventText: {
        color: "black",
    },
});