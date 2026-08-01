import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import SmallAppBar from "../../components/SmallAppBar";
import LargeButton from "../../components/LargeButton";
import Header3Text from "../../components/typography/Header3Text";
import SubBodyText from "../../components/typography/SubBodyText";
import { db, auth } from "../../provider/Firebase";
import firebase from "firebase/compat";
import { blockPerson } from "../Explore/People/FullProfile";

const avatarPlaceholderLight = require("../../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../../assets/icons/avatar-placeholder-dark.png");

export default function ChatSettings({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const { group, otherUser, otherImage } = route.params;
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const user = auth.currentUser;

  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    db.collection("Users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        setIsArchived((doc.data()?.archivedGroupIDs || []).includes(group.groupID));
      });
  }, []);

  const handleArchive = () => {
    db.collection("Users")
      .doc(user.uid)
      .update({
        archivedGroupIDs: isArchived
          ? firebase.firestore.FieldValue.arrayRemove(group.groupID)
          : firebase.firestore.FieldValue.arrayUnion(group.groupID),
      })
      .then(() => {
        navigation.navigate("Chats");
      })
      .catch((error) => {
        alert(`Couldn't ${isArchived ? "unarchive" : "archive"} this chat: ` + error.message);
      });
  };

  const reportPerson = () => {
    navigation.navigate("ReportPerson", { user: otherUser });
  };

  return (
    <Layout>
      <SmallAppBar title="Chat settings" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate("FullProfile", { person: otherUser })}
        >
          <Image
            source={otherImage ? { uri: otherImage } : undefined}
            placeholder={avatarPlaceholder}
            placeholderContentFit="cover"
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.avatar}
          />
          <View style={styles.profileText}>
            <Header3Text color={tokens.onBackground} style={{ fontSize: 13 }}>
              {group.name}
            </Header3Text>
            <SubBodyText color={tokens.onBackground}>View profile</SubBodyText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tokens.onBackground} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <LargeButton
            outlined
            color="green"
            leadingIcon={<Ionicons name="archive-outline" size={16} color={tokens.primary} />}
            onPress={handleArchive}
          >
            {isArchived ? "Unarchive chat" : "Archive chat"}
          </LargeButton>
          <LargeButton
            outlined
            color="gray"
            leadingIcon={<Ionicons name="alert-circle-outline" size={16} color={`${tokens.textMedium}B3`} />}
            onPress={reportPerson}
          >
            Report
          </LargeButton>
          <LargeButton
            outlined
            color={tokens.error}
            leadingIcon={<Ionicons name="ban-outline" size={16} color={tokens.error} />}
            onPress={() => blockPerson(otherUser.id, navigation, "Chats")}
          >
            Block
          </LargeButton>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 25,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileText: {
    flex: 1,
    gap: 6,
  },
  actions: {
    gap: 10,
  },
});
