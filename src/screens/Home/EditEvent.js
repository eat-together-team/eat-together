import React, { useState, useEffect, useRef } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Dimensions,
    Platform
} from "react-native";

import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import TextInput from "../../components/TextInput";
import { TopNav, Layout } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import eventTags from "../../eventTags";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import RBSheet from "react-native-raw-bottom-sheet";
import TagsSection from "../../components/TagsSection";

import getDate from "../../getDate";
import getTime from "../../getTime";
import Button from "../../components/Button";

import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";

import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../../provider/Firebase";
import { checkProfanity } from "../../methods";
import { cloneDeep } from "lodash";
import moment from "moment";

export default function ({ route, navigation }) {
    // State variables for the inputs
    const [photo, setPhoto] = useState("https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [tagsSelected, setTagsSelected] = useState([]);
    const [tagsValue, setTagsValue] = useState("");

    // Other variables
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [mode, setMode] = useState("date");
    const [disabled, setDisabled] = useState(true);

    const [loading, setLoading] = useState(false); // Disable button if event is being created in Firebase

    const refRBSheet = useRef(); // To toggle the bottom drawer on/off

    // Get current event info
    useEffect(() => {
        setName(route.params.event.name);
        setLocation(route.params.event.location);

        setStartDate(route.params.event.startDate
            ? route.params.event.startDate.toDate()
            : route.params.event.date.toDate());
        setEndDate(route.params.event.endDate
            ? route.params.event.endDate.toDate()
            : new Date(moment(route.params.event.date.toDate()).add(1, "hours").toDate()));

        setAdditionalInfo(route.params.event.additionalInfo);
        setTagsSelected(route.params.event.tags ? route.params.event.tags : []);
        setPhoto(route.params.event.image ? route.params.event.image : photo);
    }, []);

    // Checks whether we should disable the Post button or not
    useEffect(() => {
        if (name === "" || location === "") {
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
    }, [name, location, tagsSelected]);

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

    // For posting the event
    const storeEvent = (id, hasImage, image) => {
        const newEvent = {
            id,
            name,
            location,
            startDate,
            endDate,
            additionalInfo,
            hasImage,
            image
        };

        let table = "Private Events";

        if (route.params.event.type === "public") {
            newEvent.tags = tagsSelected;
            table = "Public Events";
        }

        db.collection(table).doc(route.params.event.id).update(newEvent).then(() => {
            newEvent.startDate = moment(startDate);
            newEvent.endDate = moment(endDate);
            route.params.editEvent({...newEvent, type: route.params.event.type});
            route.params.editEvent2({...newEvent, type: route.params.event.type});
            navigation.goBack();
            alert("Meal updated!");
        });
    }

    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText center>Edit Event</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        color={loading ? "grey" : "black"}
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
            <KeyboardAvoidingWrapper
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : ""}
            >
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => handleChoosePhoto()}>
                        <ImageBackground source={{ uri: photo }} style={styles.image}>
                            <View style={styles.imageOverlay}>
                                <Ionicons name="image-outline" color="white" size={30}></Ionicons>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1 }}>
                        <ScrollView style={styles.content}>
                            <TextInput
                                placeholder="Event Name"
                                value={name}
                                onChangeText={(val) => {
                                    setName(val);
                                }}
                                iconLeft="chatbubble-outline"
                                mainContainerStyle={styles.input}
                                required
                            />

                            <TouchableOpacity onPress={() => {
                                setShowStartDate(true);
                                setMode("date");
                            }} style={styles.input}>
                                <View pointerEvents="none">
                                    <TextInput
                                        value={getDate(startDate)}
                                        iconLeft="calendar-outline"
                                        editable={false}
                                        width="100%"
                                        required
                                    />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.dateTime}>
                                <TouchableOpacity onPress={() => {
                                    setShowStartDate(true);
                                    setMode("time");
                                }} style={styles.smallInput}>
                                    <View pointerEvents="none">
                                        <NormalText center>Start time</NormalText>
                                        <TextInput
                                            value={getTime(startDate)}
                                            iconLeft="time-outline"
                                            width="100%"
                                            editable={false}
                                            required
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
                                            required
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>                        

                            <DateTimePickerModal isVisible={showStartDate} date={startDate}
                                mode={mode} onConfirm={changeStartDate} onCancel={() => setShowStartDate(false)}
                                minimumDate={new Date()} maximumDate={moment().add(1, "months").toDate()}/>
                            <DateTimePickerModal isVisible={showEndDate} date={endDate}
                                mode={mode} onConfirm={changeEndDate} onCancel={() => setShowEndDate(false)}
                                minimumDate={startDate} maximumDate={moment().add(1, "months").toDate()}/>

                            <TextInput
                                placeholder="Location"
                                value={location}
                                onChangeText={(val) => {
                                    setLocation(val);
                                }}
                                iconLeft="location-outline"
                                mainContainerStyle={styles.input}
                                required
                            />
                            
                            <TextInput
                                placeholder="Additional Info"
                                value={additionalInfo}
                                onChangeText={(val) => setAdditionalInfo(val)}
                                mainContainerStyle={{
                                    ...styles.input, minHeight:65, height: "auto"
                                }}
                                height={100}
                                multiline={true}
                                iconLeft="document-text-outline"
                                scrollEnabled={false}
                            />

                            {route.params.event.type === "public" && <TouchableOpacity onPress={() => refRBSheet.current.open()}
                                style={styles.input}>
                                <View pointerEvents="none">
                                    <TextInput
                                        placeholder="Tags"
                                        value={tagsValue}
                                        iconLeft="pricetags-outline"
                                        editable={false}
                                        width="100%"
                                    />
                                </View>
                            </TouchableOpacity>}

                            <Button disabled={disabled || loading} onPress={() => {
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
                                    let hasImage = false;
                                    if (photo !== "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400") {
                                        hasImage = true;
                                        
                                        if (photo !== route.params.event.image) {
                                            storeImage(photo, route.params.event.id).then(() => {
                                                fetchImage(route.params.event.id).then(uri => {
                                                    storeEvent(route.params.event.id, hasImage, uri);
                                                });
                                            });
                                        } else {
                                            storeEvent(route.params.event.id, hasImage, route.params.event.image);
                                        }
                                    } else {
                                        storeEvent(route.params.event.id, hasImage, "");
                                    }
                                }
                            }} marginVertical={20}>{loading ? "Updating ..." : "Update"}</Button>
                        </ScrollView>
                    </View>

                    {route.params.event.type === "public" && <RBSheet
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
                    </RBSheet>}
                </View>
            </KeyboardAvoidingWrapper>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
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
        width: "100%"
    },

    image: {
        width: Dimensions.get("screen").width,
        height: 150
    },

    dateTime: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    smallInput: {
        width: "47%"
    }
});