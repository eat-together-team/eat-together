import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Alert, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import LargeText from "../../components/LargeText";
import TextInput from "../../components/TextInput";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import Filter from "../../components/Filter";
import HorizontalRow from "../../components/HorizontalRow";

import { auth, db, storage } from "../../provider/Firebase";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Global variables
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2.7 * 5 * numColumns) / numColumns;


export default function EventGallery({ route, navigation }) {
    const user = auth.currentUser;
    const [event, setEvent] = useState(route.params.event);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [imageGallery, setImageGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [userNames, setUserNames] = useState("");

    // Caption Vairables
    const [firstName,setFirstName] = useState('');
    const [lastName,setLastName] = useState('');
    const [imageCaption,setImageCaption] = useState('');
    const [timeUploaded,setTimeUploaded] = useState()

    // Image Caption upload
    const [caption,setCaption] = useState('');
    const [isCaptionModalVisible, setIsCaptionModalVisible] = useState(false);

    // For downloading
    const [downloading, setDownloading] = useState(false);

    // Use Effect to get the image gallery Data
    useEffect(() => {
        let db_name = event.type === "public" ? "Public Events" : "Private Events";
        const unsubscribe = db.collection(db_name).doc(event.id).onSnapshot((eventDoc) => {
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                if (eventData && eventData.eventGallery && Array.isArray(eventData.eventGallery)) {
                    setImageGallery(eventData.eventGallery);
                    fetchUserNames(eventData.eventGallery);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
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
                { cancelable: true }
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
        setLoading(true);
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
            imageCaption:'Click the Add/Edit Button to insert a caption!',
        };

        let db_name = event.type === "public" ? "Public Events" : "Private Events";
        await db.collection(db_name).doc(event.id).update({
            eventGallery: firebase.firestore.FieldValue.arrayUnion(newImage),
        });
        setLoading(false);

    };

    const addImage = async () => {
        const imageId = Date.now() + "_" + event.id;
        await handleChoosePhoto(imageId).then(() => {
            alert("Image Uploaded!");
        })
        .catch((error) => {
            console.error("Image upload failed: ", error);
        });
    };

    const deleteImage = async (imageUrl) => {
        setLoading(true);
        
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
                imageCaption:image.imageCaption,
            };

            const storageRef = storage.ref().child(`eventGallery/${event.id}/${image.imageId}`);
            await storageRef.delete();
            
            let db_name = image.imagePermissions === "public" ? "Public Events" : "Private Events";
            await db.collection(db_name).doc(event.id).update({
                eventGallery: firebase.firestore.FieldValue.arrayRemove(toDelete),
            });
    
            setImageGallery(prevImages => prevImages.filter(img => img.imageId !== image.imageId));
            alert("Image Deleted Successfully!");
    
        } catch (error) {
            alert("Error deleting image: " + error.message);
            console.error("Error deleting image: ", error);
            setLoading(false);
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
        const uploadedTime = new Date(image.imageUploadedTime).toLocaleDateString('en-US', {   year: 'numeric', month: 'long', day: 'numeric',});
        setTimeUploaded(uploadedTime)
        setImageCaption(image.imageCaption);
        if (image) {
            const userDoc = await db.collection("Users").doc(image.userUploaded).get();
            let uploadedBy = "Unknown User";
            if (userDoc.exists) {
                const userData = userDoc.data();
                setFirstName(userData.firstName)
                setLastName(userData.lastName);
                uploadedBy = `${userData.firstName} ${userData.lastName}`;
            }
        } 
    };

    const fetchUserNames = async (images) => {
        const userIds = [...new Set(images.map(img => img.userUploaded))];
        const newUserNames = { ...userNames };
    
        await Promise.all(userIds.map(async (userId) => {
            if (!newUserNames[userId]) {
                const userDoc = await db.collection("Users").doc(userId).get();
                newUserNames[userId] = userDoc.exists
                    ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
                    : "Unknown User";
            }
        }));
    
        setUserNames(newUserNames);
        const sortedImages = images.slice().sort((a, b) => {
            const nameA = newUserNames[a.userUploaded] || "Unknown User";
            const nameB = newUserNames[b.userUploaded] || "Unknown User";
            return nameA.localeCompare(nameB);
        });
    
        setImageGallery(sortedImages);
    };
    
    const renderColumn = ({ item }) => {
        const uploadedBy = userNames[item.userUploaded] || "Loading...";
        return (
            <View style={styles.columnItem}>
                <MediumText>{uploadedBy}</MediumText>
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={{ width: 350, height: 211, marginVertical: 10 }}>
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
                    <View style={[styles.imageItem, { width: tileSize, height: tileSize }]}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 15 }} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            );
        }
    };

    // Add image caption
    const addCaption = async(imageUrl,imageCaption) => {
        setLoading(true);
        const image = imageGallery.findIndex(img => img.imageUrl === imageUrl);
        if (image !== -1) {
            // Update the image's event assignment
            const updatedImages = [...imageGallery];
            updatedImages[image] = {
                ...updatedImages[image],
                imageCaption: imageCaption,
            };
            // Update the user document with the modified gallery array
            let db_name = image.imagePermissions === "public" ? "Public Events" : "Private Events";
            await db.collection(db_name).doc(event.id).update({
                eventGallery: updatedImages,
            });
            // await db.collection("Users").doc(user.uid).update({
            //     gallery: updatedImages,
            // });


            // Update the state or do any necessary actions after assigning the image to the event
            setImageGallery(updatedImages);
            setCaption('');
            alert("Caption Added!");
            setIsCaptionModalVisible(false);
            setIsModalVisible(false);

        } else if(image == 0){
            // Handle the case where the image is not found
            alert("Only the User that uploaded the image can edit it! ");
        }


        setLoading(false);
    };

    const editCaption = async (imageUrl) =>{
        setIsCaptionModalVisible(true);
        await addCaption(imageUrl);

    };

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);
        getMetadata(uri);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const downloadImage = async (imageUrl) => {
        try {
            // Request permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            
            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to download the image!');
                return;
            }
            
            // Set image path
            const fileUri = `${FileSystem.documentDirectory}EatTogether${Date.now()}.jpg`;

            // Download the image to the file system
            const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

            // Save the downloaded image to the gallery
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Downloads', asset, false);

            alert('Image downloaded successfully!');
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Error downloading the image.');
        }
    };

    useEffect(() => {
        if (downloading) {
            downloadImage(selectedImageUri).then(() => {
                setDownloading(false);
            }).catch((error) => {
                console.error("Download failed: ", error);
                setDownloading(false);
            });
        }
    }, [downloading]);

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
                        contentContainerStyle={[styles.flatListContentContainer,]}
                        key={column ? 'column' : 'grid'}
                    />
                ) : (
                    <EmptyState title="No Images" text="Add some photos to your event gallery!" />
                )}
            </View>
            <Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
                <TopNav
                    middleContent={<MediumText>   </MediumText>}
                    leftContent={<Ionicons name="chevron-back" size={20} />}
                    leftAction={() => handleCloseModal()}
                    rightContent={<Ionicons name="download-outline" size={20} style={{opacity: downloading ? 0.3 : 1}}/>}
                    rightAction={() => {
                        if (!downloading) {
                            setDownloading(true);
                        }
                    }}
                />
                <TouchableWithoutFeedback onPress={handleCloseModal}>
                    <View style={styles.modalBackground}>
                        <Image style={{ width: screenWidth, height: screenWidth, resizeMode: 'cover' }} source={{ uri: selectedImageUri }} />
                    </View>
                </TouchableWithoutFeedback>

                <View style={styles.modalBottom}> 
                    {/* Image Information */}
                    <View style={{ flexDirection: "row", padding: 10, alignItems: "center", justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <NormalText weight='bold'>{firstName} </NormalText>
                            <NormalText weight='bold'>{lastName}</NormalText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Filter checked={false} onPress={() => editCaption(selectedImageUri)} text="Add | Edit" />
                            <Filter checked={false} onPress={() => handleDeleteImage(selectedImageUri)} text="Delete" />
                        </View>
                    </View>
                    <NormalText style ={{flexDirection: "row", padding:10, alignItems:"center",paddingHorizontal:10,opacity:0.6}}>{imageCaption}</NormalText>
                    <NormalText style ={{flexDirection: "row", padding:10, alignItems:"center",paddingHorizontal:10,}}>{timeUploaded}</NormalText>
                </View>
            </Modal>
            <Modal visible={isCaptionModalVisible} transparent={true} onRequestClose={() => setIsCaptionModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => {setIsCaptionModalVisible(false),setLoading(false)}}>
                    <View style={modalStyles.modalBackground}>
                        <View style={modalStyles.modalContainer}>
                            <View style={modalStyles.captionItem}>
                                <LargeText style={modalStyles.eventText}>Insert Caption</LargeText>
                                <TextInput
                                    placeholder="Insert Caption"
                                    value={caption}
                                    width="100%"
                                    onChangeText={(val) => {
                                        setCaption(val);
                                    }}
                                    iconLeft="information-circle-outline"
                                    required
                                    mainContainerStyle={{
                                        marginBottom: 10, minHeight:65, height:"auto", 
                                    }}
                                />
                                <Button onPress={() => addCaption(selectedImageUri,caption)}>Add Caption</Button>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </Layout>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "flex-start",
        marginVertical: 20,
        marginHorizontal:10,
    },
    container: {
        flex: 1,
        alignItems: "left",
        justifyContent: "center", // Change justifyContent to flex-start
    },
    imageItem: {
        margin: 5,
    },
    columnItem: {
        marginVertical: 5,
        width: '100%',
        alignItems: 'left',
    },
    flatListContentContainer: {
        justifyContent: "flex-start",
        paddingHorizontal: 5,
        alignItems: 'left', 
    },
    modalBackground: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "100%",
    },
    modalBottom: {
        height: screenWidth-64,
        backgroundColor: "white",
    },

});
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

