import React, { useEffect, useState,useRef} from "react";
import { StyleSheet, FlatList, View, Image, Alert, Dimensions, Modal, TouchableOpacity, TouchableWithoutFeedback,} from "react-native";
import { Layout, TopNav,Picker} from "../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import { auth, db, storage } from "../../provider/Firebase";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase/compat";
import LargeText from "../../components/LargeText";
import Link from "../../components/Link";
import TextInput from "../../components/TextInput";
import NormalText from "../../components/NormalText";

// Global variables
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2.7 * 5 * numColumns) / numColumns;

export default function Gallery({ route, navigation }) {
    // State Variables
    const user = auth.currentUser;
    const galleryOwnerId = route.params?.userId || user?.uid;
    const viewingUserName = route.params?.userName || "";
    const isOwnGallery = galleryOwnerId === user?.uid;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredImages, setFilteredImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [attendedEventNames, setAttendedEventNames] = useState([]);
    const [isEventModalVisible, setIsEventModalVisible] = useState(false);
    const [isCaptionModalVisible, setIsCaptionModalVisible] = useState(false);
    const [selectedImageForEvent, setSelectedImageForEvent] = useState(null);
    
    // Picker Function
    const [caption,setCaption] = useState('');

    // Image Details
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [imageCaption, setImageCaption] = useState();
    const [assignedEventName, setAssignedEventName] = useState('Unknown Event');
    const [timeUploaded, setTimeUploaded] = useState();

    // Filters
    const [newest, setNewest] = useState(true);
    const [oldest, setOldest] = useState(false);
    const [grid, setGrid] = useState(true);
    const [column, setColumn] = useState(false);
    const [meetup, setMeetup] = useState(false);

    // For downloading
    const [downloading, setDownloading] = useState(false);

    // Reference Variables for the selection component
    const showViewFilterRef = useRef();
    const showRecentFilterRef = useRef();    

    // Use Effect to fetch image data
    useEffect(() => {
        if (!galleryOwnerId) return;
        const unsubscribe = db.collection("Users").doc(galleryOwnerId).onSnapshot((userDoc) => {
            try {
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const fetchedImages = userData.gallery || [];
                    setImages(fetchedImages);
                    setFilteredImages(fetchedImages);
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                }
            } catch (error) {
                console.error("Error fetching images: ", error);
            } finally {
                setLoading(false);
            }
        });
    
        // Clean up the listener on component unmount
        return () => unsubscribe();
    

    }, [galleryOwnerId]);

    // Use effect to fetch attended events of the user
    useEffect(() => {
        const fetchAttendedEvents = async () => {
            try {
                const userDoc = await db.collection("Users").doc(galleryOwnerId).get();
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
                return {eventName,eventId};
            }));
            setAttendedEventNames(names);
        };

        fetchEventNames();
    }, [attendedEvents]);

    

    const getMetadata = async (uri) => {
        const image = images.find(item => item.imageUrl === uri);

        if (image) {
            const uploadedTime = new Date(image.imageUploadedTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            let eventName = '';
            const caption = image.imageCaption;
            setImageCaption(caption);
            setCaption(caption);
            setTimeUploaded(uploadedTime);

            try {
                // Check if the event ID exists in the Public Events collection
                const publicEventDoc = await db.collection("Public Events").doc(image.imageEventAssigned).get();
                if (publicEventDoc.exists) {
                    eventName = publicEventDoc.data().name;
                    setAssignedEventName(eventName);
                } else {
                    // If not found in Public Events, check Private Events collection
                    const privateEventDoc = await db.collection("Private Events").doc(image.imageEventAssigned).get();
                    if (privateEventDoc.exists) {
                        eventName = privateEventDoc.data().name;
                        setAssignedEventName(eventName);
                    } else {
                        // If event ID not found in either collection
                        eventName = 'Unknown Event';
                        setAssignedEventName(eventName);
                    }
                }
            } catch (error) {
                console.error("Error fetching event details: ", error);
                eventName = 'Unknown Event';
                setAssignedEventName(eventName);
            }
        }
    };
    
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
                { cancelable: true }
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
            if (!result.canceled) {
                const uri = result.assets[0].uri;
                await uploadImage(uri, imageId);
            }
        } catch (error) {
            alert("Error uploading message: " + error.message);
        }
    };

    // Stores images in the storage and image reference in firestore

    const uploadImage = async (uri, imageId) => {
        setLoading(true);
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
            imageCaption:'Click the Add/Edit Button to insert a caption!',
        };

        await db.collection("Users").doc(user.uid).update({
            gallery: firebase.firestore.FieldValue.arrayUnion(storeId),
        });
        setLoading(false);
    };

    // Main Add Photo Function

    const addPhoto = async () => {
        const imageId = Date.now() + "_" + user.uid;
        await handleChoosePhoto(imageId)
            .then(() => {
                alert("Image Uploaded!");
            })
            .catch((error) => {
                console.error("Image upload failed: ", error);
            });
    };

    // Function to delete images from database

    const deleteImage = async (imageUrl) => {
        setLoading(true);
        
        try {
            const image = images.find(img => img.imageUrl === imageUrl);
            const toDelete = {
                imageEventAssigned:image.imageEventAssigned,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                imageUploadedTime: image.imageUploadedTime,
                imageCaption: image.imageCaption,
            };

            const storageRef = storage.ref().child(`Gallery/${user.uid}/${image.imageId}`);
            await storageRef.delete();
            
            await db.collection("Users").doc(user.uid).update({
                gallery: firebase.firestore.FieldValue.arrayRemove(toDelete),
            });

            alert("Image Deleted Successfully!");
            setImages(prevImages => prevImages.filter(img => img.imageId !== image.imageId));
        } catch (error) {
            alert("Error deleting image: " + error.message);
            console.error("Error deleting image: ", error);
        }

        setLoading(false);
    };

    // Function to handle image Deletion

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

    // Main rendering function

    const renderImage = ({ item }) => {
        if (column) {
            return renderDateView({ item });
        }
        else if (meetup) {
            return renderEventView({ item });

                
        }
        else {
            return (
                <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
                    <View style={[styles.imageItem, { width: tileSize, height: tileSize }]}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 15, }} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            );
        }
    };
    
    // Renders Date view

    const renderDateView = ({ item }) => {
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

    // Renders Event View

    const renderEventView = ({ item }) => {
        let meetupName ="";
        const eventId = item.imageEventAssigned;
        const event = attendedEvents.find(event => event?.id === eventId);
        if(event){
            eventName=attendedEventNames.find( name => name?.eventId === event.id);
            meetupName=eventName.eventName;
        } 
        else{
            meetupName="Unassigned Event";
        }


        return (
            <View style={styles.columnItem}>
                <MediumText>{meetupName}</MediumText>
                <TouchableOpacity onPress={() =>  handleImagePress(item.imageUrl)}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: item.imageUrl }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
            

        
    // Modal Handlers

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);
        getMetadata(uri);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleAssignEvent = (uri) => {
        setIsModalVisible(false);
        setSelectedImageForEvent(uri);
        setIsEventModalVisible(true);
    };

    const handleEventSelect = (eventId) => {
        if (selectedImageForEvent) {
            assignImageToEvent(eventId);
            setIsEventModalVisible(false);
        } else {
            console.error("No image selected for event assignment.");
        }
    };

        
    // Function to assign image to events
                    
    const assignImageToEvent = async (eventId) => {
        try {
            // Find the index of the image in the gallery array
            const imageIndex = images.findIndex(img => img.imageUrl === selectedImageUri);
            if (imageIndex !== -1) {
                // Update the image's event assignment
                const updatedImages = [...images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    imageEventAssigned: eventId,
                };
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

    // Add image caption

    const addCaption = async(imageUrl,imageCaption) => {
        setLoading(true);
        const image = images.findIndex(img => img.imageUrl === imageUrl);
        
        if (image !== -1) {
            // Update the image's event assignment
            const updatedImages = [...images];
            updatedImages[image] = {
                ...updatedImages[image],
                imageCaption: imageCaption,
            };
            // Update the user document with the modified gallery array
            await db.collection("Users").doc(user.uid).update({
                gallery: updatedImages,
            });

            // Update the state or do any necessary actions after assigning the image to the event
            setImages(updatedImages);
            alert("Caption Added!");
            setIsCaptionModalVisible(false);
            setIsModalVisible(false);

        } else {
            // Handle the case where the image is not found
            alert("Caption could not be added.");
        }

        setLoading(false);
    };

    const editCaption = async (imageUrl) =>{
        setIsCaptionModalVisible(true);
        await addCaption(imageUrl);
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
    }, [meetup, newest, oldest, grid, column, images]);

    const filterByNewest = (newImages) => {
        return newImages.sort((a, b) => b.imageUploadedTime - a.imageUploadedTime);
    };

    const filterByOldest = (newImages) => {
        return newImages.sort((a, b) => a.imageUploadedTime - b.imageUploadedTime);
    };

    // Assigns the attendedEventNames to items so that the picker can use it for Assigning images to an Event
    const items = attendedEventNames.map(item => ({
        label: item.eventName,
        value: item.eventId,
    }));

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
                middleContent={
                    <MediumText>
                        {isOwnGallery
                            ? "Your Photo Gallery"
                            : viewingUserName
                            ? `${viewingUserName}'s Photo Gallery`
                            : "Photo Gallery"}
                    </MediumText>
                }
                leftContent={<Ionicons name="chevron-back" size={20} />}
                leftAction={() => {
                    if (!isOwnGallery && route.params?.person) {
                        navigation.navigate("FullProfile", { person: route.params.person });
                    } else {
                        navigation.goBack();
                    }
                }}
            />

            {isOwnGallery && (
                <View style={styles.buttonContainer}>
                    <Button style={styles.button} onPress={addPhoto}> Add Photos </Button>
                </View>
            )}

            {filteredImages.length > 0 && (
            <View>
                <HorizontalRow style={{ paddingHorizontal: 20 }}>
                    <Filter checked={column || grid || meetup}
                        onPress={() => showViewFilterRef.current.open()}
                        text={grid ? "Grid View" : 
                            column ? "Column View with Dates":
                            meetup ?"Column View with Events":"   View   "}/>
                    <RBSheet
                        height={190}
                        ref={showViewFilterRef}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            wrapper: {
                                backgroundColor: "rgba(0,0,0,0.5)",
                            },
                            draggableIcon: {
                                backgroundColor: "black"
                            },
                            container: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                padding: 10
                            }
                    }}>
                        <Filter checked={grid} text="Grid View" marginBottom={5}
                            onPress={() => {
                                setGrid(true); 
                                setColumn(false);   
                                setMeetup(false);                        
                                showViewFilterRef.current.close();
                        }}/>
                        <Filter checked={column} text="Column View with Dates" marginBottom={5}
                            onPress={() => {
                                setColumn(true); 
                                setGrid(false);
                                setMeetup(false);
                                showViewFilterRef.current.close();
                        }}/>
                        <Filter checked={meetup} text="Column View with Events" marginBottom={5}
                            onPress={() => {
                                setColumn(false); 
                                setGrid(false);
                                setMeetup(true);
                                showViewFilterRef.current.close();
                        }}/>


                        <Link onPress={() => {
                            showViewFilterRef.current.close();
                        }}>
                            Close
                        </Link>
                    </RBSheet> 


                    <Filter checked={newest || oldest}
                        onPress={() => showRecentFilterRef.current.open()}
                        text={newest ? "Sort By Most Recent" : oldest ? "Sort By Least Recent":"   Recency   "}/>
                    <RBSheet
                        height={150}
                        ref={showRecentFilterRef}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            wrapper: {
                                backgroundColor: "rgba(0,0,0,0.5)",
                            },
                            draggableIcon: {
                                backgroundColor: "black"
                            },
                            container: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                padding: 5,
                            }
                    }}>
                        <Filter checked={oldest} text="Sort By Least Recent" marginBottom={5}
                            onPress={() => {
                                setOldest(true); 
                                setNewest(false);
                                showRecentFilterRef.current.close();
                        }}/>
                        <Filter checked={newest} text="Sort By Most Recent" marginBottom={5}
                            onPress={() => {
                                setNewest(true); 
                                setOldest(false);
                            showRecentFilterRef.current.close();
                        }}/>
                        <Link onPress={() => {
                            showRecentFilterRef.current.close();
                        }}>
                            Close
                        </Link>
                    </RBSheet> 
                </HorizontalRow>
            </View>
            )}

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
                ) : (
                    <EmptyState
                        title="No Images"
                        text={isOwnGallery ? "Add some photos to your event gallery!" : "No photos in this gallery."}
                    />
                )}
            </View>
            {/*  Assign  Images to a event*/}
            <Modal visible={isEventModalVisible} transparent={true} onRequestClose={() => setIsEventModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setIsEventModalVisible(false)}>
                    <View style={modalStyles.modalBackground}>
                        <View style={modalStyles.modalContainer}>
                            <LargeText style={modalStyles.eventText}>Assign to an Event</LargeText>
                            <View style={modalStyles.eventItem}>
                                <Picker
                                    items={items.reverse()}
                                    placeholder="Select an Event"
                                    onValueChange={(val) => {
                                        handleEventSelect(val);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Modal visible={isCaptionModalVisible} transparent={true} onRequestClose={() => setIsCaptionModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => {setIsCaptionModalVisible(false),setLoading(false)}}>
                    <View style={modalStyles.modalBackground}>
                        <View style={modalStyles.modalContainer}>
                            <View>
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
                        <Image style={{ width: screenWidth, height:screenWidth, resizeMode: 'cover' }} source={{ uri: selectedImageUri }} />
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.modalBottom}>
                <View style={{ flexDirection: "row", padding: 10, alignItems: "center", justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <NormalText weight='bold'>{firstName} </NormalText>
                        <NormalText weight='bold'>{lastName}</NormalText>
                    </View>
                    {isOwnGallery && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Filter checked={false} onPress={() => editCaption(selectedImageUri)} text="Add | Edit" />
                        <Filter checked={false} onPress={() => handleDeleteImage(selectedImageUri)} text="Delete" />
                    </View>
                    )}
                </View>
                    <NormalText style ={{flexDirection: "row", padding:5, alignItems:"center",paddingHorizontal:10,opacity:0.6}}>{imageCaption}</NormalText>
                    <NormalText style ={{flexDirection: "row", padding:5, alignItems:"center",paddingHorizontal:10,}}>{timeUploaded}</NormalText>
                    <NormalText style ={{flexDirection: "row", padding:5, alignItems:"center",paddingHorizontal:10,}}>Event Assigned: {assignedEventName}</NormalText>

                    {isOwnGallery && (
                    <View style={styles.assignBottom}> 
                        <Button backgroundColor="white" color="#5DB075" onPress={() => handleAssignEvent(selectedImageUri)}>Assign Image</Button>
                    </View>
                    )}
                </View>

            </Modal>
        </Layout>
    );
}
// Styles for the screen
const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "flex-start",
        marginVertical: 20,
        marginHorizontal:10,
    },
    container: {
        flex: 1,
        alignItems: "left",
        justifyContent: "center",
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalBottom: {
        height: screenWidth-64,
        backgroundColor: "white",
    },
    assignBottom: {
        height: 115,
        backgroundColor: '#5DB075',
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',   
        bottom: 0,           
        left: 0,             
    },
        rightIcons: {
        flexDirection: 'row',
    },
    icon: {
        fontSize: 25,
        marginRight: 10,
    },
    imageContainer: {
        width: 350,
        height:211,
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

const captionStyles = StyleSheet.create({
    rowText:{
        flexDirection: "row",
        padding:10, 
        alignItems:"center",
        paddingHorizontal:10,
    }
});
