// "People in this photo" bottom sheet — opened from EventPhotoViewer either
// via its header people icon (self-uploaded photos only) or by tapping the
// tagged-people summary row under any photo that has tags. Lists everyone
// tagged, tapping one goes to their profile; when `canAdd` is true (the
// viewer uploaded this photo) each row also gets a remove button, and an
// "Add people" button sits at the bottom.
//
// Figma only sketched this as an unfinished scrim placeholder (no actual
// sheet content), so this reuses the app's existing Dialog/Scrim modal
// pattern instead, adapted into a bottom-anchored sheet.

import React, { useEffect, useState } from "react";
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Scrim from "./Scrim";
import UserListItem from "./UserListItem";
import LargeButton from "./LargeButton";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";
import { fetchPeopleByIds } from "../utils/fetchPeopleByIds";
import { db } from "../provider/Firebase";

const dbNameForEvent = (event) => (event?.type === "private" ? "Private Events" : "Public Events");

const toPerson = (data) => ({
  id: data.id,
  name: [data.firstName, data.lastName].filter(Boolean).join(" "),
  image: data.hasImage ? data.image : null,
});

const PeopleInPhotoSheet = ({ visible, event, photo, canAdd, onAddPress, onDismiss, onPhotoUpdated, navigation }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const taggedUserIds = photo?.taggedUserIds || [];
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchPeopleByIds(taggedUserIds).then((data) => {
      setPeople(data.map(toPerson));
      setLoading(false);
    });
  }, [visible, taggedUserIds.join(",")]);

  const handlePersonPress = (person) => {
    onDismiss();
    navigation.navigate("FullProfile", { person });
  };

  const handleRemove = async (personId) => {
    if (removingId) return;
    setRemovingId(personId);
    try {
      const eventRef = db.collection(dbNameForEvent(event)).doc(event.id);
      const doc = await eventRef.get();
      const gallery = (doc.data() && doc.data().eventGallery) || [];
      const updatedTaggedUserIds = taggedUserIds.filter((id) => id !== personId);
      const updatedGallery = gallery.map((p) =>
        p.imageId === photo.imageId ? { ...p, taggedUserIds: updatedTaggedUserIds } : p
      );
      await eventRef.update({ eventGallery: updatedGallery });

      setPeople((prev) => prev.filter((p) => p.id !== personId));
      onPhotoUpdated?.({ ...photo, taggedUserIds: updatedTaggedUserIds });
    } catch (error) {
      console.error("Error removing tagged person: ", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.container}>
        <Scrim onPress={onDismiss} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: tokens.background, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: tokens.containerHigh }]} />

          <Header4Text color={tokens.onBackground} style={styles.title}>
            People in this photo
          </Header4Text>

          {!loading && people.length === 0 && (
            <SubBodyText color={tokens.textLight} style={styles.empty}>
              No one tagged yet
            </SubBodyText>
          )}

          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {people.map((person) => (
              <UserListItem
                key={person.id}
                person={person}
                onPress={handlePersonPress}
                renderRight={
                  canAdd && (
                    <TouchableOpacity hitSlop={8} onPress={() => handleRemove(person.id)}>
                      <Ionicons
                        name={removingId === person.id ? "hourglass-outline" : "trash-outline"}
                        size={20}
                        color={tokens.onContainerHigh}
                      />
                    </TouchableOpacity>
                  )
                }
              />
            ))}
          </ScrollView>

          {canAdd && (
            <View style={styles.addButtonWrap}>
              <LargeButton
                outlined
                color="gray"
                onPress={onAddPress}
                leadingIcon={<Ionicons name="add" size={18} color={`${tokens.textMedium}B3`} />}
              >
                Add people
              </LargeButton>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radiusTokens.large,
    borderTopRightRadius: radiusTokens.large,
    maxHeight: "70%",
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: radiusTokens.extraSmall,
    marginBottom: 16,
  },
  title: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  addButtonWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});

export default PeopleInPhotoSheet;
