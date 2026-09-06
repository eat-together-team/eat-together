// New-event creation wizard — replaces the old single-page Organize.js.
// Mirrors CreateAccountFlow.js's shape: this screen owns all the
// accumulated form state and steps through child step components, rather
// than each step being its own navigation route. Step 4 is the last one —
// its "Post"/"Save changes" action does the real Firestore submission (see
// handlePost/handleSaveChanges), reusing Organize.js's original write shape.
//
// Doubles as the edit flow: when navigated to with `route.params.event`,
// every field initializes from that event instead of blank, step titles and
// the final button/dialog switch to their edit wording, and the final step
// updates the existing doc in place instead of creating a new one.

import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Animated, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import * as firebase from "firebase/compat";

import { colorTokens } from "../../../theme/colorTokens";
import { useTheme } from "../../../rapi_ui_components";
import SmallAppBar from "../../../components/SmallAppBar";
import LargeButton from "../../../components/LargeButton";
import OrganizeStep1 from "./OrganizeStep1";
import OrganizeStep2 from "./OrganizeStep2";
import OrganizeStep3 from "./OrganizeStep3";
import OrganizeStep4 from "./OrganizeStep4";
import EventPostedDialog from "./EventPostedDialog";

import { db, auth, storage } from "../../../provider/Firebase";
import { checkProfanity } from "../../../utils/methods";
import icebreakerList from "../../../utils/icebreakerList";
import parseLocation from "../../../utils/parseLocation";

const TOTAL_STEPS = 4;
const CREATE_STEP_TITLES = { 1: "Create event", 2: "Add a location", 3: "Add event tags", 4: "Finalize details" };
const EDIT_STEP_TITLES = { 1: "Edit event", 2: "Edit event location", 3: "Edit event tags", 4: "Finalize details" };
const REQUIRED_FIELDS_MESSAGE = "Your event must have a title, date, type and time to proceed";
const LOCATION_REQUIRED_MESSAGE = "Please select a location to proceed";

// Picks 5 unique random icebreaker questions — same silent, not-a-wizard-
// step behavior Organize.js had (used by the Would You Rather game screens).
const pickIcebreakers = () => {
  const picked = [];
  const usedIndexes = new Set();
  while (picked.length < 5 && usedIndexes.size < icebreakerList.length) {
    const index = Math.floor(Math.random() * icebreakerList.length);
    if (!usedIndexes.has(index)) {
      usedIndexes.add(index);
      picked.push(icebreakerList[index]);
    }
  }
  return picked;
};

export default function OrganizeFlow({ navigation, route }) {
  const editingEvent = route?.params?.event || null;
  const isEditMode = !!editingEvent;

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const fontRegular = fontsLoaded
    ? "Inter_400Regular"
    : Platform.OS === "ios" ? "AppleSDGothicNeo-Regular" : "sans-serif";

  // Step 1 fields — initialized from `editingEvent` when editing. `date` and
  // `startTime`/`endTime` all derive from the same source timestamp(s):
  // each field only ever reads the portion (day, or time-of-day) it cares
  // about, so seeding them all from startDate/endDate is safe.
  const [title, setTitle] = useState(editingEvent?.name || "");
  const [image, setImage] = useState(editingEvent?.hasImage ? editingEvent.image : "");
  const [type, setType] = useState(editingEvent?.type || "");
  const [date, setDate] = useState(editingEvent?.startDate ? editingEvent.startDate.toDate() : null);
  const [startTime, setStartTime] = useState(editingEvent?.startDate ? editingEvent.startDate.toDate() : null);
  const [endTime, setEndTime] = useState(editingEvent?.endDate ? editingEvent.endDate.toDate() : null);
  const [description, setDescription] = useState(editingEvent?.additionalInfo || "");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Step 2 fields — lat/lng aren't part of the flattened `location` string
  // (see parseLocation), so they're pulled from their own stored fields
  // when editing; older events predating those fields just won't have a
  // map pin available (StaticMapImage renders nothing without lat/lng).
  const [location, setLocation] = useState(
    editingEvent
      ? {
          ...parseLocation(editingEvent.location),
          lat: editingEvent.locationLat ?? null,
          lng: editingEvent.locationLng ?? null,
        }
      : null
  );

  // Step 3 fields — no required fields on this step, tags are optional.
  const [tags, setTags] = useState(editingEvent?.tags || []);

  // Step 4 — submission state. `postedEvent` carries the just-created
  // event's fields forward to "Invite friends" (InvitePeople.js's
  // isExistingEvent path — see that file's header comment).
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postedEvent, setPostedEvent] = useState(null);

  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [currentStep]);

  const isStep1Valid = title.trim() && type && date && startTime && endTime;
  const isStep2Valid = !!location;

  // Clear a shown error as soon as the current step's missing fields get
  // filled in.
  useEffect(() => {
    if (currentStep === 1 && error && isStep1Valid) setError("");
  }, [title, type, date, startTime, endTime, currentStep, error, isStep1Valid]);

  useEffect(() => {
    if (currentStep === 2 && error && isStep2Valid) setError("");
  }, [location, currentStep, error, isStep2Valid]);

  const isNextDisabled = () => {
    if (currentStep === 1) return !isStep1Valid;
    if (currentStep === 2) return !isStep2Valid;
    return false;
  };

  const requiredFieldsMessage = () => {
    if (currentStep === 2) return LOCATION_REQUIRED_MESSAGE;
    return REQUIRED_FIELDS_MESSAGE;
  };

  // The bottom "Cancel" button always abandons the whole flow; the header's
  // back arrow instead steps back one page (matching CreateAccountFlow.js's
  // Back button), except on step 1 where there's nowhere to go back to.
  const handleCancel = () => navigation.goBack();

  const handleBack = () => {
    setError("");
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (isNextDisabled()) {
      setError(requiredFieldsMessage());
      return;
    }
    setError("");
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  // The real submission — same Firestore write shape Organize.js used
  // (collection choice by type, hostedEventIDs/attendingEventIDs/
  // attendedEventIDs update, the event's group chat), adapted to this
  // wizard's fields: `date` + `startTime`/`endTime` are combined into real
  // Date objects, and `location` (a {name, address} object from step 2's
  // Yelp search) is flattened to the plain string the rest of the app
  // expects `event.location` to be.
  const handlePost = async () => {
    if (submitting) return;

    if (checkProfanity(title) || checkProfanity(description)) {
      Alert.alert("Please revise", "Your event title or description contains inappropriate language.");
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      const userDoc = await db.collection("Users").doc(user.uid).get();
      const userInfo = userDoc.data();

      const id = String(Date.now()) + user.uid;
      const collectionName = type === "public" ? "Public Events" : "Private Events";

      const startDateTime = new Date(date);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      const endDateTime = new Date(date);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      let chatID = String(startDateTime) + title;
      if (chatID.includes("/")) chatID = chatID.replace(/\//g, ",");

      const hasImage = !!image;
      let imageUrl = "";
      if (hasImage) {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = storage.ref().child("eventPictures/" + id);
        await ref.put(blob);
        imageUrl = await ref.getDownloadURL();
      }

      const locationString = `${location.name} - ${location.address}`;

      await db.collection(collectionName).doc(id).set({
        id,
        name: title,
        hostID: user.uid,
        hostFirstName: userInfo.firstName,
        hostLastName: userInfo.lastName,
        hasHostImage: userInfo.hasImage,
        hostImage: userInfo.hasImage ? userInfo.image : "",
        location: locationString,
        // Straight from the Yelp search result the location was picked
        // from — lets the event view render a map pin with no separate
        // geocoding step. Firestore rejects `undefined`, so null when Yelp
        // didn't have coordinates for some reason.
        locationLat: location.lat ?? null,
        locationLng: location.lng ?? null,
        startDate: startDateTime,
        endDate: endDateTime,
        additionalInfo: description,
        ice: pickIcebreakers(),
        attendees: [user.uid],
        hasImage,
        image: imageUrl,
        tags,
        chatID,
        type,
      });

      const storeID = { type, id };
      await db.collection("Users").doc(user.uid).update({
        hostedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
        attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
        attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
      });

      // The Groups doc itself isn't created here — `chatID` is just reserved
      // as its future id. The chat only actually gets created the first
      // time someone taps "Event chat" on the event view (startEventChat in
      // Chats.js), so no one sees an empty chat before that happens.
      setPostedEvent({
        id,
        type,
        name: title,
        location: locationString,
        startDate: startDateTime,
        endDate: endDateTime,
        additionalInfo: description,
        hasImage,
        image: imageUrl,
      });
      setPosted(true);
    } catch (err) {
      Alert.alert("Something went wrong", err.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Editing an existing event — updates the doc in place instead of
  // creating a new one. Skips everything one-time creation does (chat
  // creation, hostedEventIDs/attendingEventIDs/attendedEventIDs, a fresh
  // random icebreaker set): those already exist from when the event was
  // first posted. The one wrinkle is `type` being changeable here — if it
  // flips public/private, the doc has to move collections (same id) and the
  // host's {id, type} refs need swapping to match.
  const handleSaveChanges = async () => {
    if (submitting) return;

    if (checkProfanity(title) || checkProfanity(description)) {
      Alert.alert("Please revise", "Your event title or description contains inappropriate language.");
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      const startDateTime = new Date(date);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      const endDateTime = new Date(date);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      const hasImage = !!image;
      let imageUrl = hasImage ? editingEvent.image : "";
      if (hasImage && image !== editingEvent.image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = storage.ref().child("eventPictures/" + editingEvent.id);
        await ref.put(blob);
        imageUrl = await ref.getDownloadURL();
      }

      const locationString = `${location.name} - ${location.address}`;
      const oldCollectionName = editingEvent.type === "public" ? "Public Events" : "Private Events";
      const newCollectionName = type === "public" ? "Public Events" : "Private Events";

      const updatedFields = {
        name: title,
        location: locationString,
        locationLat: location.lat ?? null,
        locationLng: location.lng ?? null,
        startDate: startDateTime,
        endDate: endDateTime,
        additionalInfo: description,
        hasImage,
        image: imageUrl,
        tags,
        type,
      };

      if (newCollectionName !== oldCollectionName) {
        await db.collection(newCollectionName).doc(editingEvent.id).set({ ...editingEvent, ...updatedFields });
        await db.collection(oldCollectionName).doc(editingEvent.id).delete();

        const oldStoreID = { type: editingEvent.type, id: editingEvent.id };
        const newStoreID = { type, id: editingEvent.id };
        await db.collection("Users").doc(user.uid).update({
          hostedEventIDs: firebase.firestore.FieldValue.arrayRemove(oldStoreID),
          attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(oldStoreID),
          attendedEventIDs: firebase.firestore.FieldValue.arrayRemove(oldStoreID),
        });
        await db.collection("Users").doc(user.uid).update({
          hostedEventIDs: firebase.firestore.FieldValue.arrayUnion(newStoreID),
          attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(newStoreID),
          attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(newStoreID),
        });
      } else {
        await db.collection(newCollectionName).doc(editingEvent.id).update(updatedFields);
      }

      setPostedEvent({
        id: editingEvent.id,
        type,
        name: title,
        location: locationString,
        startDate: startDateTime,
        endDate: endDateTime,
        additionalInfo: description,
        hasImage,
        image: imageUrl,
      });
      setPosted(true);
    } catch (err) {
      Alert.alert("Something went wrong", err.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteFriends = () => {
    setPosted(false);
    navigation.navigate("InvitePeople", {
      ...postedEvent,
      attendees: [auth.currentUser.uid],
      from: "WhileYouEat",
    });
  };

  const handleCloseDialog = () => {
    setPosted(false);
    navigation.goBack();
  };

  const isFinalStep = currentStep === TOTAL_STEPS;
  const handlePrimaryAction = () => {
    if (!isFinalStep) return handleNext();
    return isEditMode ? handleSaveChanges() : handlePost();
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrganizeStep1
            title={title}
            setTitle={setTitle}
            image={image}
            setImage={setImage}
            type={type}
            setType={setType}
            date={date}
            setDate={setDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            description={description}
            setDescription={setDescription}
            error={error}
            datePickerVisible={datePickerVisible}
            setDatePickerVisible={setDatePickerVisible}
            startTimePickerVisible={startTimePickerVisible}
            setStartTimePickerVisible={setStartTimePickerVisible}
            endTimePickerVisible={endTimePickerVisible}
            setEndTimePickerVisible={setEndTimePickerVisible}
          />
        );
      case 2:
        return <OrganizeStep2 location={location} setLocation={setLocation} error={error} />;
      case 3:
        return <OrganizeStep3 tags={tags} setTags={setTags} />;
      case 4:
        return (
          <OrganizeStep4
            title={title}
            image={image}
            description={description}
            tags={tags}
            type={type}
            date={date}
            startTime={startTime}
            endTime={endTime}
            location={location}
          />
        );
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={{ color: tokens.textMedium, fontFamily: fontRegular }}>
              Step {currentStep} — coming soon
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: tokens.background }]}>
      <SmallAppBar
        title={(isEditMode ? EDIT_STEP_TITLES : CREATE_STEP_TITLES)[currentStep] || "Create event"}
        onBack={handleBack}
      />

      <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
        {renderContent()}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.footerButton}>
          <LargeButton outlined color={tokens.outline} onPress={handleCancel}>
            Cancel
          </LargeButton>
        </View>
        {/* Deliberately not passing `disabled` here (unlike CreateAccountFlow's
            Next button) — tapping while invalid still needs to fire handleNext
            so it can show the InformationCard error; only the dimmed opacity
            communicates the disabled look. */}
        <View style={[styles.footerButton, { opacity: submitting ? 0.6 : isNextDisabled() ? 0.4 : 1 }]}>
          <LargeButton
            color="green"
            onPress={handlePrimaryAction}
            leadingIcon={
              isFinalStep ? <Ionicons name="checkmark" size={16} color={tokens.onPrimary} /> : undefined
            }
          >
            {isFinalStep
              ? submitting
                ? isEditMode ? "Saving..." : "Posting..."
                : isEditMode ? "Save changes" : "Post"
              : "Next"}
          </LargeButton>
        </View>
      </View>

      {posted && (
        <EventPostedDialog
          visible={posted}
          title={isEditMode ? "Event updated!" : "Event posted!"}
          date={date}
          onInviteFriends={handleInviteFriends}
          onClose={handleCloseDialog}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  footerButton: {
    flex: 1,
  },
});
