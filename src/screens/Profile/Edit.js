import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import { db, storage } from "../../provider/Firebase";

import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import SuggestSelection from "../../components/SuggestSelection";

import pronounTags from "../../utils/pronounTags";
import schools from "../../utils/schools";

import { AuthContext } from "../../provider/AuthProvider";
import { checkProfanity } from "../../utils/methods";
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
    const [school, setSchool] = useState(route.params.user.school);
    const [schoolSelected, setSchoolSelected] = useState(school ? [school] : []);

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
    }, [pronounTagsSelected]);

    useEffect(() => {
        setSchool(schoolSelected.join(""));
    }, [schoolSelected]);

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
            setImage(result.assets[0].uri);
        }
    };

    // Clear image to match the "Delete photo" action in the mock. 
    const clearImage = () => {
        setImage(null); // This visually removes the image and updates the saved state on submit.
    }

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
        } else if (pronouns.length === 0) {
            alert("Pronouns can't be empty (select from dropdown, or type and press \"Enter\")");
        } else if (checkProfanity(bio)) {
            alert("Fun fact has inappropriate words");
        } else if (bio.length === 0) {
            alert("Fun fact can't be empty");
        } else {
            route.params.updateInfo(firstName, lastName, pronouns, bio, tags, image);

            if (image !== oldImage) {
                // Handle delete-photo path without calling upload logic.
                if (!image) {
                    await db.collection("Users").doc(route.params.user.id).update({
                        firstName,
                        lastName,
                        age: parseInt(age),
                        pronouns,
                        bio,
                        tags,
                        hasImage: false, // Clear the flag so UI can fall back to default avatar.
                        image: "", // Store empty value to represent a deleted photo.
                        school
                    }).then(() => {
                        updateProfileImg(null); // Clear cached profile image in context.
                        alert("Profile updated!");
                        navigation.goBack();
                    });
                } else {
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
                                image: uri,
                                school
                            }).then(() => {
                                alert("Profile updated!");
                                navigation.goBack();
                                updateEventsPfp(uri);
                            });
                        });
                    });
                }
            } else {
                await db.collection("Users").doc(route.params.user.id).update({
                    firstName,
                    lastName,
                    age: parseInt(age),
                    pronouns,
                    bio,
                    tags,
                    school
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

    // Reusable section header to match the dotted divider style in the mock.
    const renderSectionHeader = (title) => (
        <View style={styles.sectionHeader}>
            <NormalText style={styles.sectionTitle}>{title}</NormalText>
            <View style={styles.sectionLine} />
        </View>
    );

    // Renders a tag category card with dashed border, shadow chips, and tinted CTA.
    const renderTagCategory = ({ title, buttonLabel, borderColor, chipStyle, textColor, buttonStyle, onPress, items }) => (
        <View style={[styles.tagCategoryCard, { borderColor }]}>
            <View style={styles.tagsRow}>
                {items.map((tag, index) => (
                    <View key={`${title}-${index}`} style={[styles.tagChip, styles.tagChipShadow, chipStyle]}>
                        <NormalText size={12} color={textColor}>{tag}</NormalText>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={[styles.tagCategoryButton, buttonStyle]} onPress={onPress}>
                <NormalText size={12} color="#111">{buttonLabel}</NormalText>
            </TouchableOpacity>
        </View>
    );

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
                        {/* Remove the required-asterisk legend to align with the mock's clean layout. */}
                        {renderSectionHeader("Picture")}
                        <View style={styles.photoRow}>
                            <View style={styles.photoActions}>
                                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                    <NormalText style={styles.photoButtonText}>Upload photo</NormalText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.photoButtonSecondary} onPress={clearImage}>
                                    <NormalText style={styles.photoButtonSecondaryText}>Delete photo</NormalText>
                                </TouchableOpacity>
                            </View>
                            <Image style={styles.image} source={image ? { uri: image } : require("../../../assets/logo.png")} />
                        </View>

                        {renderSectionHeader("Fun fact")}
                        {/* Dashed, multiline input to match the mock's fun fact box. */}
                        <TextInput
                            placeholder="Type here to add a fun fact to your profile"
                            onChangeText={(val) => setBio(val)}
                            value={bio}
                            width={"100%"}
                            multiline
                            height={120}
                            iconLeft=""
                            required
                            mainContainerStyle={styles.funFactContainer}
                            textInputStyle={styles.funFactInput}
                        />

                        {renderSectionHeader("Identity")}
                        {/* Stack name fields to match the mock's full-width inputs. */}
                        <TextInput
                            placeholder="First name"
                            onChangeText={(val) => setFirstName(val)}
                            iconLeft="" // Hide icons for the cleaner mock style.
                            value={firstName}
                            width={"100%"}
                            required
                            mainContainerStyle={styles.identityInput}
                        />
                        <TextInput
                            placeholder="Last name"
                            onChangeText={(val) => setLastName(val)}
                            iconLeft="" // Hide icons for the cleaner mock style.
                            value={lastName}
                            width={"100%"}
                            required
                            mainContainerStyle={styles.identityInput}
                        />

                        {/* Pronouns + Birth year row matches the side-by-side mock layout. */}
                        <View style={{...styles.row, zIndex: 12}}>
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
                                        borderColor: '#B0B0B0', // Neutral border to match the identity input styling.
                                        borderRadius: 10,
                                        marginTop: 2,
                                        width: "100%",
                                        height: 44,
                                        backgroundColor: "white"
                                    }}
                                    selectedItemsStyle={{
                                        margin: 0,
                                        height: 44,
                                        width: "100%",
                                        justifyContent: "space-around",
                                        backgroundColor: "white",
                                        borderColor: "#B0B0B0", // Neutral border to match the identity input styling.
                                        borderWidth: 2,
                                        borderRadius: 10,
                                    }}
                                    textInputProps = {{
                                        placeholder: "Pronouns",
                                    }}
                                    containerStyle = {{
                                        // Keep dropdown aligned without covering other inputs.
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
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Birth year"
                                onChangeText={(val) => setAge(val)}
                                width={"47%"}
                                iconLeft="" // Hide icons for the cleaner mock style.
                                value={age}
                                required
                                mainContainerStyle={styles.identityInput}
                            />
                        </View>
                        {/* Campus full-width input mirrors the mock's single line field. */}
                        <View style={{...styles.school, zIndex: 11}}>
                            <SuggestSelection
                                multi={true}
                                selectedItems={schoolSelected}
                                onItemSelect={(item) => {
                                    setSchoolSelected(item.length !== 0 ? [item] : []);
                                }}
                                onRemoveItem={() => {
                                    setSchoolSelected([]);
                                }}
                                itemStyle={{
                                    padding: 10,
                                    borderWidth: 2,
                                    borderColor: "#B0B0B0", // Neutral border to match the identity input styling.
                                    borderRadius: 10,
                                    marginTop: 2,
                                    width: "100%",
                                    height: 44,
                                    backgroundColor: "white"
                                }}
                                selectedItemsStyle={{
                                    margin: 0,
                                    height: 44,
                                    width: "100%",
                                    justifyContent: "space-around",
                                    backgroundColor: "white",
                                    borderColor: "#B0B0B0", // Neutral border to match the identity input styling.
                                    borderWidth: 2,
                                    borderRadius: 10
                                }}
                                height={44}
                                textInputProps={{
                                    placeholder: "Campus" // Copy the mock's field label.
                                }}
                                onSubmitEditing = {(e) => {
                                    if (e.nativeEvent.text.length !== 0) {
                                        const newSelectedItems = [e.nativeEvent.text];
                                        setSchoolSelected(newSelectedItems);
                                    }}
                                }
                                containerStyle = {{
                                    // Keep dropdown aligned without covering other inputs.
                                    height: 0,
                                    marginBottom: 300
                                }}
                                selectedItemsWidth={"100%"}
                                items={cloneDeep(schools)}
                                chip={true}
                                resetValue={false}
                                required
                            />
                        </View>
                        
                        {renderSectionHeader("Tags")}
                        {/* Category cards mimic the three dashed boxes shown in the mock. */}
                        {renderTagCategory({
                            title: "Food",
                            buttonLabel: "Edit favorite foods",
                            borderColor: "#E6C7F4",
                            chipStyle: styles.tagChipPurple,
                            textColor: "#5A2D82",
                            buttonStyle: styles.tagButtonPurple, // Match the tinted CTA in the mock.
                            items: tags.filter(t => t.type === "food").map(t => t.tag),
                            onPress: () => navigation.navigate("EditTags", {
                                schoolTags: tags.filter(t => t.type === "school").map(t => t.tag),
                                hobbyTags: tags.filter(t => t.type === "hobby").map(t => t.tag),
                                foodTags: tags.filter(t => t.type === "food").map(t => t.tag),
                                updateTags
                            })
                        })}
                        {renderTagCategory({
                            title: "Hobbies",
                            buttonLabel: "Edit hobbies",
                            borderColor: "#BFE1FA",
                            chipStyle: styles.tagChipBlue,
                            textColor: "#2A5C8A",
                            buttonStyle: styles.tagButtonBlue, // Match the tinted CTA in the mock.
                            items: tags.filter(t => t.type === "hobby").map(t => t.tag),
                            onPress: () => navigation.navigate("EditTags", {
                                schoolTags: tags.filter(t => t.type === "school").map(t => t.tag),
                                hobbyTags: tags.filter(t => t.type === "hobby").map(t => t.tag),
                                foodTags: tags.filter(t => t.type === "food").map(t => t.tag),
                                updateTags
                            })
                        })}
                        {renderTagCategory({
                            title: "Education",
                            buttonLabel: "Edit education",
                            borderColor: "#F7E7B0",
                            chipStyle: styles.tagChipGold,
                            textColor: "#8A6B1F",
                            buttonStyle: styles.tagButtonGold, // Match the tinted CTA in the mock.
                            items: tags.filter(t => t.type === "school").map(t => t.tag),
                            onPress: () => navigation.navigate("EditTags", {
                                schoolTags: tags.filter(t => t.type === "school").map(t => t.tag),
                                hobbyTags: tags.filter(t => t.type === "hobby").map(t => t.tag),
                                foodTags: tags.filter(t => t.type === "food").map(t => t.tag),
                                updateTags
                            })
                        })}

                        {renderSectionHeader("Other")}
                        {/* Outlined button to match the mock's photo gallery action. */}
                        <TouchableOpacity style={styles.galleryButton}>
                            <NormalText style={styles.galleryButtonText}>Edit photo gallery</NormalText>
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
    // Smaller image size to align with the mock's layout next to buttons.
    image: {
        width: 90,
        height: 90,
        borderColor: "#5DB075",
        borderWidth: 2,
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

    // Row layout for the "Upload/Delete photo" buttons and avatar.
    photoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },

    // Left column with two action buttons, stacked vertically.
    photoActions: {
        flex: 1,
        marginRight: 12
    },

    // Primary outlined button for "Upload photo" to match the mock.
    photoButton: {
        borderWidth: 2,
        borderColor: "#5DB075",
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
        marginBottom: 10
    },

    // Neutral outlined button for "Delete photo".
    photoButtonSecondary: {
        borderWidth: 1,
        borderColor: "#C9C9C9",
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center"
    },

    // Button text colors to align with mock colors.
    photoButtonText: {
        color: "#5DB075"
    },

    photoButtonSecondaryText: {
        color: "#B0B0B0"
    },

    // Remove fixed height so inputs can expand (esp. multiline fun fact).
    row: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },

    school: {
        width: "100%",
        height: "8%",
        zIndex: 10
    },

    // Section header (label + dotted line) used across the page.
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 10
    },

    sectionTitle: {
        marginRight: 10,
        color: "#666"
    },

    sectionLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: "#D0D0D0",
        borderStyle: "dashed"
    },

    // Dashed fun fact container that mimics the mock's large input area.
    funFactContainer: {
        borderStyle: "dashed",
        borderWidth: 2,
        borderColor: "#D0D0D0",
        height: 120,
        alignItems: "flex-start",
        paddingVertical: 6
    },

    funFactInput: {
        textAlignVertical: "top"
    },

    // Identity input styling to match the mock's thicker, rounded borders.
    identityInput: {
        borderWidth: 2,
        borderColor: "#B0B0B0",
        height: 44,
        marginBottom: 12
    },

    // Tag category card wrapper with dashed border and soft padding.
    tagCategoryCard: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 12,
        marginBottom: 14
    },

    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10
    },

    // Base chip style; colors per category are layered in.
    tagChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#F0F0F0"
    },

    // Subtle shadow to lift chips like in the mock.
    tagChipShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },

    // Category chip color variants to match the mock.
    tagChipPurple: {
        backgroundColor: "#F3E6FB"
    },

    tagChipBlue: {
        backgroundColor: "#E3F2FD"
    },

    tagChipGold: {
        backgroundColor: "#FFF3CD"
    },

    // Button inside each tag card, centered and subdued.
    tagCategoryButton: {
        backgroundColor: "#EEF1F4",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center"
    },

    // CTA color variants to match the tag group tint.
    tagButtonPurple: {
        backgroundColor: "#F1E7F6"
    },

    tagButtonBlue: {
        backgroundColor: "#E8F2F7"
    },

    tagButtonGold: {
        backgroundColor: "#F2F4E4"
    },

    // Outlined action for the "Other" section.
    galleryButton: {
        borderWidth: 1,
        borderColor: "#C9C9C9",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center"
    },

    galleryButtonText: {
        color: "#B0B0B0"
    }
});



