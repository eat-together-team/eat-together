import React, { useContext, useRef, useState } from "react";
import { View, StyleSheet, Image, ScrollView, TextInput, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFonts, Inter_700Bold } from "@expo-google-fonts/inter";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import { db, storage } from "../../provider/Firebase";
import { AuthContext } from "../../provider/AuthProvider";
import { checkProfanity } from "../../utils/methods";
import pronounTags from "../../utils/pronounTags";
import schools from "../../utils/schools";

import SmallAppBar from "../../components/SmallAppBar";
import TextInputField from "../../components/TextInputField";
import DropdownField from "../../components/DropdownField";
import LargeButton from "../../components/LargeButton";
import AboutChip from "../../components/AboutChip";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";

export default function Edit({ route, navigation }) {
    const { theme } = useTheme();
    const colors = colorTokens[theme];
    const updateProfileImg = useContext(AuthContext).updateProfileImg;
    const [fontsLoaded] = useFonts({ Inter_700Bold });
    const fontBold = fontsLoaded
        ? "Inter_700Bold"
        : Platform.OS === "ios" ? "AppleSDGothicNeo-Bold" : "sans-serif-medium";

    const [firstName, setFirstName] = useState(route.params.user.firstName);
    const [lastName, setLastName] = useState(route.params.user.lastName);
    const [pronouns, setPronouns] = useState(route.params.user.pronouns || "");
    const [bio, setBio] = useState(route.params.user.bio);
    const [campus, setCampus] = useState(route.params.user.school || "");
    const [foodTags, setFoodTags] = useState(route.params.user.tags.filter(t => t.type === "food").map(t => t.tag));
    const [hobbyTags, setHobbyTags] = useState(route.params.user.tags.filter(t => t.type === "hobby").map(t => t.tag));
    const [schoolTags, setSchoolTags] = useState(route.params.user.tags.filter(t => t.type === "school").map(t => t.tag));

    // Used to check if image has been updated or not; if not, don't update the DB
    const [oldImage] = useState(route.params.user.image);
    const [image, setImage] = useState(route.params.user.image);

    const [loading, setLoading] = useState(false);
    const [exitDialogVisible, setExitDialogVisible] = useState(false);

    // Snapshot of every editable field as it was on entry, used to decide
    // whether leaving needs the "exit without saving" confirmation.
    const initialSnapshot = useRef(JSON.stringify({
        firstName, lastName, pronouns, bio, campus, image, foodTags, hobbyTags, schoolTags
    })).current;

    const hasUnsavedChanges = () =>
        JSON.stringify({ firstName, lastName, pronouns, bio, campus, image, foodTags, hobbyTags, schoolTags }) !== initialSnapshot;

    const handleBack = () => {
        if (hasUnsavedChanges()) {
            setExitDialogVisible(true);
        } else {
            navigation.goBack();
        }
    };

    // Select image from library
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Please allow access to your photo library to upload a photo.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setImage(result.assets[0].uri);
        }
    };

    // Clear image to match the "Delete photo" action in the mock.
    const clearImage = () => setImage(null);

    // Upload image to firebase
    const updateImage = async () => {
        const response = await fetch(image);
        const blob = await response.blob();

        const ref = storage.ref().child("profilePictures/" + route.params.user.id);
        return ref.put(blob);
    };

    // Fetches image from Firebase Storage
    const fetchImage = async () => {
        const ref = storage.ref().child("profilePictures/" + route.params.user.id);
        return ref.getDownloadURL();
    };

    // Update profile pic in each event user is hosting
    const updateEventsPfp = (newImage) => {
        route.params.user.hostedEventIDs.forEach(id => {
            const table = id.type === "private" ? "Private Events" : "Public Events";
            db.collection(table).doc(id.id).update({
                hasHostImage: true,
                hostImage: newImage
            });
        });
    };

    const buildTags = () => [
        ...schoolTags.map(tag => ({ tag, type: "school" })),
        ...hobbyTags.map(tag => ({ tag, type: "hobby" })),
        ...foodTags.map(tag => ({ tag, type: "food" })),
    ];

    const handleSave = async () => {
        if (loading) return;

        if (checkProfanity(firstName) || checkProfanity(lastName)) {
            alert("Name has inappropriate words");
            return;
        } else if (firstName === "" || lastName === "") {
            alert("First and last name can't be empty");
            return;
        } else if (checkProfanity(pronouns)) {
            alert("Pronouns have inappropriate words");
            return;
        } else if (pronouns.length === 0) {
            alert("Pronouns can't be empty");
            return;
        } else if (checkProfanity(bio)) {
            alert("Fun fact has inappropriate words");
            return;
        } else if (bio.length === 0) {
            alert("Fun fact can't be empty");
            return;
        }

        setLoading(true);
        const tags = buildTags();
        const baseUpdate = { firstName, lastName, pronouns, bio, tags, school: campus };

        if (image !== oldImage) {
            if (!image) {
                // Handle delete-photo path without calling upload logic.
                await db.collection("Users").doc(route.params.user.id).update({
                    ...baseUpdate,
                    hasImage: false, // Clear the flag so UI can fall back to default avatar.
                    image: "", // Store empty value to represent a deleted photo.
                });
                updateProfileImg(null); // Clear cached profile image in context.
            } else {
                await updateImage();
                const uri = await fetchImage();
                updateProfileImg(uri);
                await db.collection("Users").doc(route.params.user.id).update({
                    ...baseUpdate,
                    hasImage: true,
                    image: uri,
                });
                updateEventsPfp(uri);
            }
        } else {
            await db.collection("Users").doc(route.params.user.id).update(baseUpdate);
        }

        route.params.updateInfo(firstName, lastName, pronouns, bio, tags, image, campus);
        setLoading(false);
        alert("Profile updated!");
        navigation.goBack();
    };

    const renderTagCategory = ({ items, chipColor, borderColor, buttonColor, buttonLabel, onPress }) => (
        <View style={[styles.tagCategoryCard, { borderColor }]}>
            {items.length > 0 && (
                <View style={styles.tagsRow}>
                    {items.map((tag, index) => (
                        <AboutChip key={`${tag}-${index}`} text={tag} color={chipColor} />
                    ))}
                </View>
            )}
            <LargeButton
                outlined
                color={buttonColor}
                onPress={onPress}
                leadingIcon={<Ionicons name="pencil-outline" size={16} color={buttonColor} />}
            >
                {buttonLabel}
            </LargeButton>
        </View>
    );

    return (
        <Layout style={styles.screen}>
            <SmallAppBar
                title="Edit profile"
                onBack={handleBack}
                actions={[{ icon: "save-outline", onPress: handleSave }]}
            />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
                <View style={styles.sections}>
                    <View style={styles.section}>
                        <Header4Text color={colors.onBackground}>Picture</Header4Text>
                        <View style={styles.photoRow}>
                            <View style={styles.photoActions}>
                                <LargeButton outlined color={colors.primary} onPress={pickImage}>
                                    Upload photo
                                </LargeButton>
                                {image && (
                                    <LargeButton outlined color={colors.outline} onPress={clearImage}>
                                        Delete photo
                                    </LargeButton>
                                )}
                            </View>
                            {image ? (
                                <Image source={{ uri: image }} style={[styles.avatar, { shadowColor: `${colors.onBackground}40` }]} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { borderColor: colors.containerHigh }]}>
                                    <Ionicons name="person-circle-outline" size={46} color={colors.containerHigh} />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Header4Text color={colors.onBackground}>Fun fact</Header4Text>
                        <View style={[styles.funFactBox, { borderColor: colors.containerHigh }]}>
                            <TextInput
                                placeholder="Type here to add a fun fact to your profile"
                                placeholderTextColor={colors.textLight}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                style={[styles.funFactInput, { color: colors.onBackground, fontFamily: fontBold }]}
                                scrollEnabled={false}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Header4Text color={colors.onBackground}>Identity</Header4Text>
                        <TextInputField hint="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
                        <TextInputField hint="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
                        <DropdownField
                            placeholder="Pronouns"
                            value={pronouns}
                            onSelect={setPronouns}
                            options={pronounTags}
                            leadingIcon={<Ionicons name="person-outline" size={16} color={colors.onBackground} />}
                        />
                        <DropdownField
                            placeholder="Campus"
                            value={campus}
                            onSelect={setCampus}
                            options={schools}
                            leadingIcon={<Ionicons name="school-outline" size={16} color={colors.onBackground} />}
                        />
                    </View>

                    <View style={styles.section}>
                        <Header4Text color={colors.onBackground}>Tags</Header4Text>
                        {renderTagCategory({
                            items: foodTags,
                            chipColor: "Purple",
                            borderColor: colors.foodTagContainer,
                            buttonColor: colors.foodTagBorder,
                            buttonLabel: "Edit favorite foods",
                            onPress: () => navigation.navigate("EditUserTags", {
                                selectedTags: foodTags,
                                onSaveTags: setFoodTags,
                                title: "favorite foods",
                                category: "food",
                            }),
                        })}
                        {renderTagCategory({
                            items: hobbyTags,
                            chipColor: "Blue",
                            borderColor: colors.hobbyTagContainer,
                            buttonColor: colors.hobbyTagBorder,
                            buttonLabel: "Edit hobbies",
                            onPress: () => navigation.navigate("EditUserTags", {
                                selectedTags: hobbyTags,
                                onSaveTags: setHobbyTags,
                                title: "hobbies",
                                category: "hobby",
                            }),
                        })}
                        {renderTagCategory({
                            items: schoolTags,
                            chipColor: "Yellow",
                            borderColor: colors.educationTagContainer,
                            buttonColor: colors.educationTagBorder,
                            buttonLabel: "Edit education",
                            onPress: () => navigation.navigate("EditUserTags", {
                                selectedTags: schoolTags,
                                onSaveTags: setSchoolTags,
                                title: "education",
                                category: "education",
                            }),
                        })}
                    </View>
                </View>
            </ScrollView>

            <DialogOverlay visible={exitDialogVisible} onDismiss={() => setExitDialogVisible(false)}>
                <Dialog
                    type="Destructive"
                    title="Exit without saving?"
                    primaryButtonText="Discard changes"
                    secondaryButtonText="Go back"
                    onPrimaryPress={() => {
                        setExitDialogVisible(false);
                        navigation.goBack();
                    }}
                    onSecondaryPress={() => setExitDialogVisible(false)}
                >
                    <SubBodyText color={colors.onBackground} center>
                        Your changes will be lost if you exit without saving your changes
                    </SubBodyText>
                </Dialog>
            </DialogOverlay>
        </Layout>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    sections: {
        gap: 25,
    },
    section: {
        gap: 15,
    },

    // Picture section
    photoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    photoActions: {
        width: 163,
        gap: 10,
    },
    avatar: {
        width: 128,
        height: 128,
        borderRadius: 64,
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
    },

    // Fun fact section
    funFactBox: {
        width: "100%",
        minHeight: 102,
        justifyContent: "center",
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: radiusTokens.medium,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    funFactInput: {
        fontSize: 20,
        padding: 0,
        textAlignVertical: "top",
        textAlign: "center",
    },

    // Tags section
    tagCategoryCard: {
        width: "100%",
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: radiusTokens.medium,
        padding: 20,
        gap: 15,
        alignItems: "center",
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        width: "100%",
    },
});
