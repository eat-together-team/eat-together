// The main page for organizing events/meetups.

import React, { useState, useEffect, useRef } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Dimensions,
    Alert
} from "react-native";
import { Layout, Picker } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import eventTags from "../../eventTags";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import RBSheet from "react-native-raw-bottom-sheet";
import TagsSection from "../../components/TagsSection";

import Header from "../../components/Header";
import getDate from "../../getDate";
import getTime from "../../getTime";
import Button from "../../components/Button";
import NormalText from "../../components/NormalText";
import Link from "../../components/Link";

import * as firebase from "firebase/compat";
import * as ImagePicker from "expo-image-picker";
import { db, auth, storage } from "../../provider/Firebase";
import _, { cloneDeep } from "lodash";
import { createNewChat } from "../Chat/Chats";
import moment from "moment";
import { checkProfanity } from "../../methods";

import Checkbox from "../../components/Checkbox";
import TextInput from "../../components/TextInput";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";

export default function ({ navigation }) {
    // Current user
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});

    const [unread, setUnread] = useState(false);

    // The type of event (public or private, for now)
    const [type, setType] = useState("");
    const items = [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
    ];

    // State variables for the inputs
    const [photo, setPhoto] = useState("https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(moment(new Date()).add(1, 'hours').toDate());
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [tagsSelected, setTagsSelected] = useState([]);
    const [tagsValue, setTagsValue] = useState("");
    const [icebreakers, setIcebreakers] = useState([]);

    // Other variables
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [mode, setMode] = useState("date");
    const [disabled, setDisabled] = useState(true);

    const [loading, setLoading] = useState(false); // Disable button if event is being created in Firebase

    const [semiPrivate, setSemiPrivate] = useState(false); //Checkbox state to see if public event should be semiprivate

    const refRBSheet = useRef(); // To toggle the bottom drawer on/off


    // Loading notifications
    useEffect(() => {

        // Load user info
        async function fetchData() {
            await db.collection("Users").doc(user.uid).onSnapshot((doc) => {
                if (doc.exists) {
                    setUserInfo(doc.data());
                    setUnread(doc.data().hasNotif);
                }
            });
        }

        fetchData();
    }, []);

    //  resets icebreakers for each new event
    useEffect(() => {
        // picks icebreaker set from set of icebreakers randomly
            var breakOptions = [];
            var usedIce = [];
            db.collection("Icebreakers").doc("icebreakers").get().then(doc => {
                while(breakOptions.length < 10) {
                    var num = Math.floor(Math.random()*(doc.data().icebreakers.length-1));
                    
                    if(!usedIce.includes(num)) {
                        breakOptions.push(doc.data().icebreakers[num]);
                        usedIce.push(num);
                    }
                }

                setIcebreakers(breakOptions);
            });
    }, [loading]);

    // Checks whether we should disable the Post button or not
    useEffect(() => {
        if (name === "" || location === "" || type === "") {
            setDisabled(true);
        } else {
            setDisabled(false);
        }

        // Determine text to display for selected tags
        let tags = "";
        if (tagsSelected.length > 0) {
            tags += tagsSelected[0];
        }

        for (let i = 1; i < tagsSelected.length; i++) {
            tags += ", " + tagsSelected[i];
        }

        setTagsValue(tags);
    }, [name, location, type, tagsSelected]);

    useEffect(() => {
        console.log(endDate);
    }, [endDate]);

    // For selecting a start date and time
    const changeStartDate = (selectedDate) => {
        const start = cloneDeep(selectedDate) || startDate;

        if (mode === "date") { // Set end date to same day as start date
            let end = cloneDeep(selectedDate) || endDate;
            end.setHours(endDate.getHours());
            end.setMinutes(endDate.getMinutes());
            end.setSeconds(59);
            setEndDate(end);

            start.setHours(startDate.getHours());
            start.setMinutes(startDate.getMinutes());
            start.setSeconds(0);
        }

        setStartDate(start); // Set the date
        setShowStartDate(false); // Exit the date/time picker modal
    };

    // For selecting an end date and time
    const changeEndDate = (selectedDate) => {
        const currentDate = selectedDate || endDate;
        setEndDate(currentDate); // Set the date
        setShowEndDate(false); // Exit the date/time picker modal
    };

    // For selecting a photo
    const handleChoosePhoto = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.cancelled) {
            setPhoto(result.uri);
        }
    };

    // Stores image in Firebase Storage
    const storeImage = async (uri, event_id) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        let ref = storage.ref().child("eventPictures/" + event_id);
        return ref.put(blob);
    };

    // Fetches image from Firebase Storage
    const fetchImage = async (id) => {
        let ref = storage.ref().child("eventPictures/" + id);
        return ref.getDownloadURL();
    }

    // Empties all fields
    const clearAll = () => {
        setSemiPrivate(false);
        setName("");
        setLocation("");
        setStartDate(new Date());
        setEndDate(moment(new Date()).add(1, 'hours').toDate());
        setAdditionalInfo("");
        setTagsSelected([]);
        setTagsValue("");
        setIcebreakers([]);
        setPhoto("https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400");
    }

    const chatID = String(startDate) + name; // To be stored in the event
  // For posting the event
    const storeEvent = (id, hasImage, image) => {
        db.collection("Users").doc(user.uid).get().then((doc) => {
            let userFriends  = semiPrivate? doc.data().friendIDs : null;
            db.collection("Public Events").doc(id).set({
                id,
                name,
                hostID: user.uid,
                hostFirstName: userInfo.firstName,
                hostLastName: userInfo.lastName,
                hasHostImage: userInfo.hasImage,
                hostImage: userInfo.hasImage ? userInfo.image : "",
                location,
                startDate,
                endDate,
                additionalInfo,
                ice: icebreakers,
                attendees: [user.uid], //ONLY start by putting the current user as an attendee
                hasImage,
                image,
                tags: tagsSelected,
                chatID: chatID,
                visibleTo: userFriends
            }).then(() => {
                const storeID = {
                    type: "public",
                    id
                };

                db.collection("Users").doc(user.uid).update({
                    hostedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
                    attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
                    attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID)
                }).then(() => {
                    clearAll(); // Clear all fields

                    // Create the in-event group chat
                    // We set userIDs as empty, meaning this chat is open to everyone!
                    createNewChat([], chatID, name, false);
                    // We are finally done!
                    alert("Success! Make sure to do attendance when the meal starts!");
                    setLoading(false);
                });
            });
        });
    }


    // Alert the user if they want to clear all details or not
    const confirmClear = () => {
        Alert.alert(
            "Clear meal details",
            "Are you sure you want to clear all fields?",
            [
                {
                    text: "No",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                { text: "Yes", onPress: () => clearAll() },
            ],
            { cancelable: false }
        );
    };

    return (
        <Layout style={{ flex: 1 }}>
            <KeyboardAvoidingWrapper
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : ""}
            >
                <View style={{ flex: 1 }}>
                    <Header name="Organize" navigation={navigation} hasNotif={unread} notifs/>
                    <TouchableOpacity onPress={() => handleChoosePhoto()}>
                        <ImageBackground source={{ uri: photo }} style={styles.image}>
                            <View style={styles.imageOverlay}>
                                <Ionicons name="md-image-outline" color="white" size={30}></Ionicons>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                    <ScrollView style={styles.content} >
                        <TextInput
                            placeholder="Meal Name"
                            value={name}
                            width="100%"
                            onChangeText={(val) => {
                                setName(val);
                            }}
                            iconLeft="chatbubble-outline"
                            mainContainerStyle={styles.input}
                        />

                        <View style={styles.multiple}>
                            <View style={styles.smallInput}>
                                <Picker
                                    items={items}
                                    value={type}
                                    placeholder="Type of meal"
                                    onValueChange={(val) => setType(val)}
                                />
                            </View>

                            <TouchableOpacity onPress={() => {
                                setShowStartDate(true);
                                setMode("date");
                            }} style={styles.smallInput}>
                                <View pointerEvents="none" style={{flex: 1}}>
                                    <TextInput
                                        value={getDate(startDate, false)}
                                        width="100%"
                                        height="100%"
                                        iconLeft="calendar-outline"
                                        editable={false}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.multiple}>
                            <TouchableOpacity onPress={() => {
                                setShowStartDate(true);
                                setMode("time");
                            }} style={styles.smallInput}>
                                <NormalText center>Start time</NormalText>
                                <View pointerEvents="none">
                                    <TextInput
                                        value={getTime(startDate)}
                                        iconLeft="time-outline"
                                        width="100%"
                                        editable={false}
                                    />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                setShowEndDate(true);
                                setMode("time");
                            }} style={styles.smallInput}>
                                <View pointerEvents="none">
                                    <NormalText center>End time</NormalText>
                                    <TextInput
                                        value={getTime(endDate)}
                                        iconLeft="time-outline"
                                        width="100%"
                                        editable={false}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Location"
                            value={location}
                            onChangeText={(val) => {
                                setLocation(val);
                            }}
                            width="100%"
                            iconLeft="location-outline"
                            mainContainerStyle={styles.input}
                        />

                        <DateTimePickerModal isVisible={showStartDate} date={startDate}
                            mode={mode} onConfirm={changeStartDate} onCancel={() => setShowStartDate(false)}
                            minimumDate={new Date()} maximumDate={moment().add(1, "months").toDate()}/>
                        <DateTimePickerModal isVisible={showEndDate} date={endDate}
                            mode={mode} onConfirm={changeEndDate} onCancel={() => setShowEndDate(false)}
                            minimumDate={startDate} maximumDate={moment().add(1, "months").toDate()}/>

                        <TextInput
                            placeholder="Additional Info"
                            value={additionalInfo}
                            onChangeText={(val) => setAdditionalInfo(val)}
                            multiline={true}
                            width="100%"
                            iconLeft="document-text-outline"
                            mainContainerStyle={{
                                marginTop: 10, minHeight:65, height:"auto", 
                            }}
                            scrollEnabled={false}
                        />

                        {type === "public" && <TouchableOpacity onPress={() => refRBSheet.current.open()}
                            style={styles.input}>
                            <View pointerEvents="none">
                                <TextInput
                                    placeholder="Tags"
                                    value={tagsValue}
                                    width="100%"
                                    iconLeft="pricetags-outline"
                                    editable={false}
                                />
                            </View>
                        </TouchableOpacity>}

                        {/*Checkbox to determine whether or not this event should be semiprivate*/}
                        {type === "public" && <View style={styles.center}>
                            <Checkbox checked = {semiPrivate} onPress = {() => {
                                setSemiPrivate(!semiPrivate);
                            }}/>
                            <NormalText>Make this event only visible to friends</NormalText>
                        </View>}

                        <View style={styles.center}>
                            <Link width="35%" onPress={confirmClear}>Clear all details</Link>
                        </View>

                        {type === "public" ? <Button disabled={disabled || loading} onPress={() => {
                            if (startDate > endDate) {
                                alert("Start time must be before end time");
                            } else if (checkProfanity(name)) {
                                alert("Name has inappropriate words >:(");
                            } else if (checkProfanity(location)) {
                                alert("Location has inappropriate words >:(");
                            } else if (checkProfanity(additionalInfo)) {
                                alert("Additional info has inappropriate words >:(");
                            } else {
                                setLoading(true);
                                const id = Date.now() + user.uid;
                                let hasImage = false;
                                if (photo !== "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400") {
                                    hasImage = true;
                                    storeImage(photo, id).then(() => {
                                        fetchImage(id).then(uri => {
                                            storeEvent(id, hasImage, uri);
                                        });
                                    });
                                } else {
                                    storeEvent(id, hasImage, "");
                                }
                            }
                        }}>
                            {loading ? "Posting ..." : "Post"}
                        </Button> :
                        <Button disabled={disabled} onPress={() => {
                            if (startDate > endDate) {
                                alert("Start time must be before end time");
                            } else if (checkProfanity(name)) {
                                alert("Name has inappropriate words >:(");
                            } else if (checkProfanity(location)) {
                                alert("Location has inappropriate words >:(");
                            } else if (checkProfanity(additionalInfo)) {
                                alert("Additional info has inappropriate words >:(");
                            } else {
                                let hasImage = false;
                                if (photo !== "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400") {
                                    hasImage = true;
                                }
                                navigation.navigate("InvitePeople", {
                                    name,
                                    location,
                                    startDate,
                                    endDate,
                                    additionalInfo: additionalInfo,
                                    hasImage: hasImage,
                                    image: hasImage ? photo : "",
                                    icebreakers,
                                    clearAll
                                });
                            }
                        }}>
                            Invite Others
                        </Button>}
                    </ScrollView>
                    
                    <RBSheet
                        height={400}
                        ref={refRBSheet}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            wrapper: {
                                backgroundColor: "rgba(0,0,0,0.5)",
                            },
                            draggableIcon: {
                                backgroundColor: "#5DB075"
                            },
                            container: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                padding: 10
                            }

                        }}>
                        <NormalText center marginBottom={10}>Add as many tags as you want!</NormalText>
                        <TagsSection
                            multi={true}
                            selectedItems={tagsSelected}
                            onItemSelect={(item) => {
                                setTagsSelected([...tagsSelected, item]);
                            }}
                            onRemoveItem={(item, index) => {
                                const newTags = tagsSelected.filter((tag, i) => i !== index);
                                setTagsSelected(newTags);
                            }}
                            items={cloneDeep(eventTags)}
                            chip={true}
                            resetValue={false}
                        />
                    </RBSheet>
                </View>
            </KeyboardAvoidingWrapper>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexGrow: 1
    },

    imageOverlay: {
        position: "absolute",
        right: 15,
        top: 15,
        padding: 5,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 10
    },

    input: {
        marginTop: 10,
        height: 50
    },

    image: {
        width: Dimensions.get("screen").width,
        height: 150
    },

    multiple: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    smallInput: {
        width: "48%"
    },

    center: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10
    }
});