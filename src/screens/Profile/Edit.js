import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons, Feather } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import { db, storage } from "../../provider/Firebase";

import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import DeviceToken from "../utils/DeviceToken";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import SuggestSelection from "../../components/SuggestSelection";

import pronounTags from "../../pronounTags";

import { AuthContext } from "../../provider/AuthProvider";
import { checkProfanity } from "../../methods";
import { cloneDeep } from "lodash";
import NormalText from "../../components/NormalText";


export default function edit({ route, navigation }) {
    // Input fields
    const [firstName, setFirstName] = useState(route.params.user.firstName);
    const [lastName, setLastName] = useState(route.params.user.lastName);
    const [age, setAge] = useState(route.params.user.age + "");
    const [pronouns, setPronouns] = useState(route.params.user.pronouns);
    const [pronounTagsSelected, setPronounTagsSelected] = useState(pronouns ? [pronouns] : []);
    const [bio, setBio] = useState(route.params.user.bio);
    const [tags, setTags] = useState(route.params.user.tags);
    const [tagText, setTagText] = useState('');

    // Used to check if image has been updated or not; if not, don't update the DB
    const [oldImage, setOldImage] = useState(route.params.user.image);
    const [image, setImage] = useState(route.params.user.image);

    const [loading, setLoading] = useState(false); // Disabling button if user profile is being updated

    const updateProfileImg = useContext(AuthContext).updateProfileImg;

    useEffect(() => {
        setTagText(displayTags(route.params.user.tags));
    }, []);

    useEffect(() => {
        setPronouns(pronounTagsSelected.join(""));
    }, [pronounTagsSelected])

    // Display text for tags
    const displayTags = tags => {
        if (tags.length > 0) {
            let string = tags[0].tag;
            for (let i = 1; i < tags.length; i++) {
                string += ", " + tags[i].tag;
            }

            return string;
        }

        return "";
    }

    // Select image from library
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    // Upload image to firebase
    const updateImage = async () => {
        if(!image) return;
        const response = await fetch(image);
        const blob = await response.blob();

        var ref = storage.ref().child("profilePictures/" + route.params.user.id);
        return ref.put(blob);
    }

    // Fetches image from Firebase Storage
    const fetchImage = async () => {
        let ref = storage.ref().child("profilePictures/" + route.params.user.id);
        return ref.getDownloadURL();
    }

    // Update user profile in Firebase
    const updateUser = async () => {
        if (checkProfanity(firstName) || checkProfanity(lastName)) {
            alert("Name has inappropriate words");
        } else if (checkProfanity(pronouns)) {
            alert("Pronouns have inappropriate words");
        } else if (checkProfanity(bio)) {
            alert("Fun fact has inappropriate words");
        } else if (bio.length < 10 || bio.length > 100) {
            alert("Fun fact must be between 10 and 100 characters");
        } else {
            route.params.updateInfo(firstName, lastName, pronouns, bio, tags, image);

            if (image !== oldImage) {
                await updateImage().then(() => {
                    fetchImage().then((uri) => {
                        updateProfileImg(uri);
                        db.collection("Users").doc(route.params.user.id).update({
                            firstName,
                            lastName,
                            age: parseInt(age),
                            pronouns,
                            bio,
                            tags,
                            hasImage: !(!image),
                            image: uri
                        }).then(() => {
                            alert("Profile updated!");
                            navigation.goBack();
                            updateEventsPfp(uri);
                        });
                    });
                });
            } else {
                await db.collection("Users").doc(route.params.user.id).update({
                    firstName,
                    lastName,
                    age: parseInt(age),
                    pronouns,
                    bio,
                    tags
                }).then(() => {
                    alert("Profile updated!");
                    navigation.goBack();
                });
            }
        }
    }

    // Update profile pic in each event user is hosting
    const updateEventsPfp = image => {
        route.params.user.hostedEventIDs.forEach(id => {
            let table = "Public Events";
            if (id.type == "private") {
                table = "Private Events";
            }

            db.collection(table).doc(id.id).update({
                hasHostImage: true,
                hostImage: image
            });
        });
    }

    // Update tags after editing them
    const updateTags = (schoolTags, hobbyTags, foodTags) => {
        schoolTags = schoolTags.map(tag => {
            return {
                tag: tag,
                type: "school"
            }
        });
        hobbyTags = hobbyTags.map(tag => {
            return {
                tag: tag,
                type: "hobby"
            }
        });
        foodTags = foodTags.map(tag => {
            return {
                tag: tag,
                type: "food"
            }
        });

        setTags([...schoolTags, ...hobbyTags, ...foodTags]);
        setTagText(displayTags([...schoolTags, ...hobbyTags, ...foodTags]));
    }

    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText>Edit Profile</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
            <ScrollView 
                scrollEnabled={true} 
                keyboardShouldPersistTaps="always" 
                nestedScrollEnabled={true}
            >
                <KeyboardAvoidingWrapper>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.imageContainer}>
                            <Image style={styles.image} source={image ? {uri: image} : require("../../../assets/logo.png")}/>
                            <TouchableOpacity style={styles.editImage} onPress={pickImage}>
                                <Feather name="edit-2" size={25} color="black"/>
                            </TouchableOpacity>
                        </View>

                        <NormalText center color="red">* = required</NormalText>

                        <View style={styles.row}>
                            <TextInput
                                placeholder="First name"
                                onChangeText={(val) => setFirstName(val)}
                                iconLeft="person-circle-outline"
                                value={firstName}
                                width={"47%"}
                                height={40}
                                required
                            />
                            <TextInput
                                placeholder="Last name"
                                onChangeText={(val) => setLastName(val)}
                                iconLeft="person-circle-outline"
                                value={lastName}
                                width={"47%"}
                                height={40}
                                required
                            />
                        </View>

                        <View style={styles.row}>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Birth year"
                                onChangeText={(val) => setAge(val)}
                                width={"47%"}
                                iconLeftType="Ionicons"
                                iconLeft="md-pencil"
                                value={age}
                                required
                            />
                            <View style={{width: "47%"}}>
                                <SuggestSelection
                                    multi={true}
                                    selectedItems={pronounTagsSelected}
                                    onItemSelect={(item) => {
                                        setPronounTagsSelected(item.length !== 0 ? [item] : []);
                                    }}
                                    onRemoveItem={() => {
                                        setPronounTagsSelected([]);
                                    }}
                                    itemStyle={{
                                        padding: 10,
                                        borderWidth: 2,
                                        borderColor: '#5DB075',
                                        borderRadius: 10,
                                        marginTop: 2,
                                        width: "100%",
                                        height: 40
                                    }}
                                    selectedItemsStyle={{
                                        margin: 0,
                                        height: 40,
                                        width: "100%",
                                        justifyContent: "space-around",
                                        backgroundColor: "white",
                                        borderColor: "lightgrey",
                                        borderWidth: 1,
                                        borderRadius: 10,
                                    }}
                                    height={40}
                                    textInputProps = {{
                                        placeholder: "Enter pronouns",
                                    }}
                                    containerStyle = {{
                                        maxHeight: 200
                                    }}
                                    onSubmitEditing = {(e) => {
                                        if (e.nativeEvent.text.length !== 0) {
                                            const newSelectedItems = [e.nativeEvent.text];
                                            setPronounTagsSelected(newSelectedItems);
                                        }}
                                    }
                                    selectedItemsWidth={"47%"}
                                    items={cloneDeep(pronounTags)}
                                    chip={true}
                                    resetValue={false}
                                    required
                                />
                            </View>
                        </View>
                        
                        <TextInput
                            placeholder="Fun fact"
                            onChangeText={(val) => setBio(val)}
                            width={"100%"}
                            iconLeftType="FontAwesome"
                            iconLeft="exclamation"
                            value={bio}
                            marginBottom={10}
                            required
                        />

                        <TouchableOpacity onPress={() => navigation.navigate("EditTags", {
                            schoolTags: tags.filter(tag => tag.type === "school").map(tag => tag.tag),
                            hobbyTags: tags.filter(tag => tag.type === "hobby").map(tag => tag.tag),
                            foodTags: tags.filter(tag => tag.type === "food").map(tag => tag.tag),
                            updateTags
                        })}>
                            <View pointerEvents="none">
                                <TextInput
                                    placeholder="Tags"
                                    onChangeText={(val) => setBio(val)}
                                    width={"100%"}
                                    iconLeft="pricetag"
                                    value={tagText}
                                    editable={false}
                                    required
                                />
                            </View>
                        </TouchableOpacity>

                        <Button disabled={firstName === "" || lastName === "" || bio === "" || loading}
                            marginVertical={40}
                            onPress={async () => {
                                setLoading(true);
                                await updateUser();
                                setLoading(false);
                            }}>
                            {loading ? "Updating ..." : "Update Profile"}
                        </Button>
                    </View>
                </KeyboardAvoidingWrapper>
            </ScrollView>
        </Layout>
    );
}
const styles = StyleSheet.create({
    image: {
        width: 150,
        height: 150,
        borderColor: "#5DB075",
        borderWidth: 3,
        borderRadius: 100,
        alignItems: 'center'
    },

    tagInput: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 10
    },

    input: {
        width: Dimensions.get('screen').width/1.5,
        marginRight: 10
    },

    imageContainer: {
        marginTop: 30,
        alignItems: "center"
    },

    editImage: {
        left: 45,
        bottom: 45,
        padding: 12,
        backgroundColor: "#5DB075",
        borderRadius: 100
    },

    row: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    }
});



