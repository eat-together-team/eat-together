import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// See ChatRoom.js's uploadImageToStorage for why: the main "expo-file-system"
// entry point's functional API throws at runtime in this SDK version.
import * as FileSystem from "expo-file-system/legacy";
// Lazily required, Android-only — same reasoning as ChatRoom.js's
// nativeStorage: this package is excluded from iOS autolinking, so a static
// import would try to reach the native module at import time on iOS too.
const nativeStorage = () => require("@react-native-firebase/storage").default();
import firebase from "firebase/compat";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

import SmallAppBar from "../../components/SmallAppBar";
import TextInputField from "../../components/TextInputField";
import LargeButton from "../../components/LargeButton";
import GroupAvatarPlaceholder from "../../components/GroupAvatarPlaceholder";
import Header4Text from "../../components/typography/Header4Text";

import { db, auth, storage } from "../../provider/Firebase";
import { deleteChat, deleteGroupForEveryone, addSystemMessage } from "./Chats";

const avatarPlaceholderLight = require("../../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../../assets/icons/avatar-placeholder-dark.png");

const AVATAR_SIZE = 130;

export default function GroupSettings({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const { group } = route.params;
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  const [groupName, setGroupName] = useState(route.params.name || "New group");
  // The last name actually persisted to Firestore — separate from groupName
  // (which tracks every keystroke) so handleNameBlur can tell a real edit
  // apart from just tapping in and back out again.
  const [savedName, setSavedName] = useState(route.params.name || "New group");
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [members, setMembers] = useState([]);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    db.collection("Groups")
      .doc(group.groupID)
      .get()
      .then((doc) => {
        const data = doc.data();
        if (data?.hasImage) {
          storage
            .ref("profilePictures/" + (data.id || group.groupID))
            .getDownloadURL()
            .then(setImageUri)
            .catch(() => {});
        }
      });
  }, []);

  useEffect(() => {
    db.collection("Users")
      .doc(user.uid)
      .get()
      .then((doc) => setFirstName(doc.data()?.firstName || ""));
  }, []);

  useEffect(() => {
    // Firestore 'in' queries cap at 10 values, so chunk larger rosters.
    const chunks = [];
    for (let i = 0; i < group.uids.length; i += 10) chunks.push(group.uids.slice(i, i + 10));

    Promise.all(
      chunks.map((chunk) =>
        db.collection("Users").where(firebase.firestore.FieldPath.documentId(), "in", chunk).get()
      )
    ).then((snapshots) => {
      const people = [];
      snapshots.forEach((snapshot) =>
        snapshot.forEach((doc) => {
          const data = doc.data();
          people.push({
            id: doc.id,
            name: data.firstName + " " + data.lastName,
            image: data.hasImage ? data.image : null,
          });
        })
      );
      setMembers(people);
    });
  }, []);

  const handleNameBlur = () => {
    const trimmed = groupName.trim() || "New group";
    setGroupName(trimmed);
    if (trimmed === savedName) return; // just tapped in and back out, not an edit

    setSavedName(trimmed);
    db.collection("Groups").doc(group.groupID).update({ name: trimmed });
    addSystemMessage(group.groupID, `${firstName} renamed the chat to ${trimmed}`);
  };

  // Same platform split as ChatRoom.js's uploadImageToStorage — firebase/compat's
  // Storage upload is a well-documented source of hangs on Android specifically
  // (Blob/XHR polyfills), so Android goes through the native module instead.
  const uploadGroupPhoto = (uri) => {
    if (Platform.OS === "android") {
      return new Promise((resolve, reject) => {
        const reference = nativeStorage().ref("profilePictures/" + group.groupID);
        const uploadTask = reference.putFile(uri, { contentType: "image/jpeg" });
        uploadTask.on("state_changed", null, reject, () => {
          reference.getDownloadURL().then(resolve).catch(reject);
        });
      });
    }

    return new Promise((resolve, reject) => {
      FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
        .then((base64) => {
          const ref = storage.ref().child("profilePictures/" + group.groupID);
          const uploadTask = ref.putString(base64, "base64", { contentType: "image/jpeg" });
          uploadTask.on("state_changed", null, reject, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
          });
        })
        .catch(reject);
    });
  };

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const downloadURL = await uploadGroupPhoto(result.assets[0].uri);
      await db.collection("Groups").doc(group.groupID).update({
        hasImage: true,
        id: group.groupID,
      });
      addSystemMessage(group.groupID, `${firstName} changed the chat icon`);
      setImageUri(downloadURL);
    } catch (error) {
      console.error("Failed to upload group photo:", error);
      alert("Couldn't upload photo: " + (error.message || "Something went wrong."));
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = () => {
    db.collection("Users")
      .doc(user.uid)
      .update({
        archivedGroupIDs: firebase.firestore.FieldValue.arrayUnion(group.groupID),
      })
      .then(() => navigation.navigate("Chats"))
      .catch((error) => {
        alert("Couldn't archive this chat: " + error.message);
      });
  };

  const handleLeave = () => {
    // Posted before deleteChat removes this user from uids — writing it
    // first guarantees normal member write access at the moment it's added.
    addSystemMessage(group.groupID, `${firstName} left the chat`)
      .then(() => deleteChat(user, group))
      .then(() => navigation.navigate("Chats"))
      .catch((error) => {
        alert("Couldn't leave this group: " + error.message);
      });
  };

  // Unlike Leave (which only removes this user), this deletes the chat for
  // every member — irreversible, so it's confirmed first.
  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete this group?",
      "This deletes the chat for everyone in it. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGroupForEveryone(group)
              .then(() => navigation.navigate("Chats"))
              .catch((error) => {
                alert("Couldn't delete this group: " + error.message);
              });
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <SmallAppBar title="Group settings" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <GroupAvatarPlaceholder size={AVATAR_SIZE} />
          )}
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: tokens.background, opacity: uploading ? 0.5 : 1 },
            ]}
            onPress={handleChangePhoto}
            disabled={uploading}
          >
            <Ionicons name="pencil" size={16} color={tokens.onBackground} />
          </TouchableOpacity>
        </View>

        <TextInputField
          value={groupName}
          onChangeText={setGroupName}
          onBlur={handleNameBlur}
          textAlign="center"
          style={styles.nameInput}
        />

        <Header4Text color={tokens.onBackground}>People</Header4Text>

        <View style={styles.peopleList}>
          {members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[styles.personRow, { backgroundColor: tokens.containerMedium }]}
              onPress={() => navigation.navigate("FullProfile", { person: member })}
            >
              <Image
                source={member.image ? { uri: member.image } : undefined}
                placeholder={avatarPlaceholder}
                placeholderContentFit="cover"
                contentFit="cover"
                cachePolicy="memory-disk"
                style={styles.personAvatar}
              />
              <Header4Text color={tokens.onBackground} style={styles.personName}>
                {member.name}
              </Header4Text>
              <Ionicons name="chevron-forward" size={18} color={tokens.textMedium} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addPeopleButton}
            onPress={() =>
              navigation.navigate("AddGroupMembers", { groupID: group.groupID, uids: group.uids })
            }
          >
            <Ionicons name="add" size={16} color={tokens.primary} />
            <Header4Text color={tokens.primary}>Add people</Header4Text>
          </TouchableOpacity>
        </View>

        <Header4Text color={tokens.onBackground}>Manage</Header4Text>

        <View style={styles.manageActions}>
          <LargeButton
            outlined
            color="gray"
            leadingIcon={<Ionicons name="log-out-outline" size={16} color={`${tokens.textMedium}B3`} />}
            onPress={handleLeave}
          >
            Leave group
          </LargeButton>
          <LargeButton
            outlined
            color="green"
            leadingIcon={<Ionicons name="archive-outline" size={16} color={tokens.primary} />}
            onPress={handleArchive}
          >
            Archive chat
          </LargeButton>
          <LargeButton
            outlined
            color={tokens.error}
            leadingIcon={<Ionicons name="trash" size={16} color={tokens.error} />}
            onPress={handleDeleteGroup}
          >
            Delete group
          </LargeButton>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
  },
  avatarWrap: {
    alignSelf: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  editButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: radiusTokens.small,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nameInput: {
    justifyContent: "center",
    width: "65%",
    alignSelf: "center",
  },
  peopleList: {
    gap: 8,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radiusTokens.small,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  addPeopleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  personName: {
    flex: 1,
  },
  manageActions: {
    gap: 10,
  },
});
