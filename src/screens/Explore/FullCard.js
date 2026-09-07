// Full event page ("View Event")

import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Linking, LayoutAnimation, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Layout, useTheme } from "../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";

import SmallAppBar from "../../components/SmallAppBar";
import FastFoodIcon from "../../components/icons/FastFoodIcon";
import LargeButton from "../../components/LargeButton";
import SmallTextButton from "../../components/SmallTextButton";
import AboutChip from "../../components/AboutChip";
import AttendeeListItem from "../../components/AttendeeListItem";
import EventViewSkeleton from "../../components/EventViewSkeleton";
import Menu from "../../components/Menu";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import StaticMapImage from "../../components/StaticMapImage";
import Header2Text from "../../components/typography/Header2Text";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";

import getTime from "../../utils/getTime";
import { pickAndUploadEventPhoto } from "../../utils/eventGallery";
import parseLocation from "../../utils/parseLocation";

import { startEventChat, addAttendeeToEventChat, removeAttendeeFromEventChat } from "../Chat/Chats";
import { db, auth } from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import openMap from "react-native-open-maps";
import { tryoutId } from "../../utils/constants";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

const foodBackground = require("../../../assets/foodBackground.png");
const PHOTO_TILE_SIZE = 130;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ordinal = (day) => {
  if (day % 10 === 1 && day !== 11) return day + "st";
  if (day % 10 === 2 && day !== 12) return day + "nd";
  if (day % 10 === 3 && day !== 13) return day + "rd";
  return day + "th";
};

// e.g. "April 4th 2026" — matches the Figma spec, which reads differently
// from getDate.js's "Mon, Apr. 4" (used by the more compact list cards).
const formatEventDate = (date) => `${MONTHS[date.getMonth()]} ${ordinal(date.getDate())} ${date.getFullYear()}`;

const chipColorForTagType = (type) =>
  type === "school" ? "Yellow" : type === "hobby" ? "Blue" : "Purple";

const InfoRow = ({ icon, color, onPress, children }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.infoRow} onPress={onPress} activeOpacity={onPress ? 0.7 : undefined}>
      <Ionicons name={icon} size={16} color={color} />
      <SubBodyText color={color}>{children}</SubBodyText>
    </Wrapper>
  );
};

const FullCard = ({ route, navigation }) => {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const event = route.params.event;
  const canAct = user.uid !== tryoutId;
  // Same "Private event" gating this screen already uses (see the info
  // badge below) — the gallery's own read/write and the "Add photo"/"View
  // all" actions below all need to agree on which collection this
  // particular event's doc (and its eventGallery field) actually lives in.
  const galleryEventType = event.type === "private" ? "private" : "public";
  const galleryCollectionName = galleryEventType === "private" ? "Private Events" : "Public Events";

  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [selfPerson, setSelfPerson] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [imageGallery, setImageGallery] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  // Fetch attendance status + attendee profiles (everything the loaded page
  // needs besides the event object itself, which arrives fully formed via
  // route params).
  useEffect(() => {
    const getAttendees = () => {
      const others = (event.attendees || []).filter((id) => id !== user.uid);
      return Promise.all(
        others.map((id) =>
          db.collection("Users").doc(id).get().then((doc) => (doc.exists ? { id: doc.id, ...doc.data() } : null))
        )
      ).then((results) => setPeople(results.filter(Boolean)));
    };

    db.collection("Users").doc(user.uid).get()
      .then((doc) => {
        const events = doc.data().attendingEventIDs.map((e) => e.id);
        setAttending(events.includes(event.id));
        // Only ever used as a fallback card when the viewer is the sole
        // attendee (see visibleAttendees) — that only happens when they're
        // actually in event.attendees, so this is safe to always capture.
        setSelfPerson({ id: user.uid, ...doc.data() });
      })
      .then(() => getAttendees())
      .then(() => setLoading(false));
  }, []);

  // Live photo gallery preview — lets the "Event photos" row update as soon
  // as someone adds a photo, without leaving this screen.
  useEffect(() => {
    const unsubscribe = db.collection(galleryCollectionName).doc(event.id).onSnapshot((doc) => {
      const data = doc.data();
      setImageGallery((data && data.eventGallery) || []);
    });

    return () => unsubscribe();
  }, [event.id, galleryCollectionName]);

  // Adds event to Google Calendar
  const addToCalendar = () => {
    const details = {
      start: event.startDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ""),
      end: event.endDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ""),
      name: event.name,
      location: event.location,
      additionalInfo: event.additionalInfo,
    };

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=
      ${details.name.trim()}&details=${details.additionalInfo}&location=${details.location}
      &dates=${details.start}/${details.end}`;

    Linking.openURL(calendarUrl);
  };

  // Attend an event
  const attend = () => {
    const storeID = { type: "public", id: event.id };

    db.collection("Users").doc(user.uid).update({
      attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
    }).then(() => {
      db.collection("Public Events").doc(event.id).update({
        attendees: firebase.firestore.FieldValue.arrayUnion(user.uid),
      }).then(() => {
        // Only joins an event chat that's already running (see
        // handleEventChat) — attending alone never starts one.
        addAttendeeToEventChat(event.chatID, user.uid).catch((error) =>
          console.error("Error adding attendee to event chat: ", error)
        );
        navigation.goBack();
        alert("You are signed up :)");
      });
    });
  };

  // Withdraw from an event you initially attended
  const withdraw = () => {
    const storeID = { type: "public", id: event.id };

    db.collection("Users").doc(user.uid).update({
      attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
    }).then(() => {
      db.collection("Public Events").doc(event.id).update({
        attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
      }).then(() => {
        // Silent — no "left the event" announcement, unlike joining.
        removeAttendeeFromEventChat(event.chatID, user.uid).catch((error) =>
          console.error("Error removing attendee from event chat: ", error)
        );
        navigation.goBack();
        alert("You withdrew :(");
      });
    });
  };

  // Opens the event's group chat, creating it first if this is the first
  // time anyone's tapped it — every current attendee (which, for the host
  // acting alone before anyone else has joined, may just be them) gets
  // added at once and a "started the event chat" announcement posted.
  const handleEventChat = async () => {
    if (!event.chatID) {
      Alert.alert("Event chat unavailable", "This event was created before event chats existed.");
      return;
    }
    if (openingChat) return;
    setOpeningChat(true);

    try {
      const groupDoc = await db.collection("Groups").doc(event.chatID).get();
      let group;

      // An empty `uids` means this doc is a leftover shell from before event
      // chats were lazily created (OrganizeFlow.js used to eagerly create an
      // empty Groups doc at event-creation time) — treat that the same as
      // not existing yet, rather than as an already-started, memberless chat.
      const alreadyStarted = groupDoc.exists && (groupDoc.data().uids || []).length > 0;

      if (alreadyStarted) {
        const data = groupDoc.data();
        group = {
          groupID: event.chatID,
          uids: data.uids,
          name: data.name,
          messages: data.messages,
          eventID: data.eventID,
          eventType: data.eventType,
        };
      } else {
        await startEventChat(event, user);
        group = {
          groupID: event.chatID,
          uids: event.attendees,
          name: event.name,
          messages: [],
          eventID: event.id,
          eventType: event.type ?? null,
        };
      }

      navigation.navigate("ChatRoom", { group });
    } catch (error) {
      console.error("Error opening event chat: ", error);
      Alert.alert("Couldn't open event chat", error.message || "Something went wrong.");
    } finally {
      setOpeningChat(false);
    }
  };

  // Report an event that the user feels is offensive in some way
  const reportEvent = () => {
    navigation.navigate("ReportEvent", { eventID: event.id });
  };

  // Same params shape InvitePeople already expects from its other callers
  // (Organize.js, WhileYouEat.js) — reused here so an existing event can
  // invite more people the same way a just-created one does.
  const inviteFriends = () => {
    navigation.navigate("InvitePeople", {
      name: event.name,
      // This screen only ever shows public events (attend/withdraw above
      // hardcode "Public Events" too) — hardcoded rather than trusting
      // event.type, which is undefined on some older event docs and would
      // otherwise crash the Firestore write in InvitePeople.js.
      type: "public",
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      attendees: event.attendees,
      additionalInfo: event.additionalInfo,
      hasImage: event.hasImage,
      image: event.hasImage ? event.image : "",
      icebreakers: event.ice,
      id: event.id,
      // InvitePeople branches its submit handler on this exact string to
      // invite into the existing event (route.params.id) instead of
      // creating a new one — WhileYouEat.js is its other "existing event"
      // caller, so this reuses that same branch rather than "FullCard".
      from: "WhileYouEat",
    });
  };

  // Shared by both the location row and the map preview below it — either
  // one tapped opens the user's own maps app.
  const handleOpenMap = () => openMap({ query: event.location, provider: "google" });

  // Delete an event you host — unlike attend/withdraw/inviteFriends above,
  // this can legitimately reach a private event (MyEvents.js routes both
  // public and private hosted events through this screen), so it trusts
  // event.type instead of hardcoding "public" — every event created via the
  // new wizard always has type set, unlike some older docs.
  const handleDeleteEvent = async () => {
    setDeleteDialogVisible(false);
    try {
      const collectionName = event.type === "private" ? "Private Events" : "Public Events";
      await db.collection(collectionName).doc(event.id).delete();

      const storeID = { type: event.type || "public", id: event.id };
      await db.collection("Users").doc(user.uid).update({
        hostedEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
        attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
        attendedEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert("Something went wrong", err.message || "Please try again.");
    }
  };

  const handleAddPhoto = () => {
    // Force the same type the gallery listener above resolved its
    // collection from — eventGallery.js's own default (anything not
    // exactly "public" goes to "Private Events") disagrees with this
    // screen's "anything not exactly 'private' is public" convention for
    // an event whose `type` is undefined (an older public-only doc), which
    // would otherwise write past where the listener is watching.
    pickAndUploadEventPhoto({ ...event, type: galleryEventType }, user).catch((error) => {
      console.error("Image upload failed: ", error);
      Alert.alert("Couldn't add photo", error.message || "Please try again.");
    });
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setExpanded((e) => !e);
  };

  const isHost = event.hostID === user.uid;
  // "Your own event" reads with slightly more emphasis (on-background @ 80%
  // instead of text-medium) per the Figma host state.
  const infoColor = isHost ? `${tokens.onBackground}CC` : tokens.textMedium;
  const titleColor = isHost ? tokens.onBackground : tokens.textNormal;
  const viewerRole = isHost ? "host" : attending ? "attending" : "guest";
  // Attendees and the host can always add photos, so they always see the
  // section (empty or not); anyone else only sees it once photos exist.
  const canManagePhotos = viewerRole === "host" || viewerRole === "attending";
  const showPhotosSection = canManagePhotos || imageGallery.length > 0;

  // Report/Withdraw/Invite friends per the two given "..." menu wireframes.
  // The host case isn't covered by a wireframe yet — reporting your own
  // event doesn't make sense, so it only gets Invite friends for now.
  const menuItems = [
    viewerRole !== "host" && {
      icon: <Ionicons name="alert-circle-outline" size={22} color={tokens.onMenuContainer} />,
      label: "Report",
      onPress: reportEvent,
    },
    viewerRole === "attending" && {
      icon: <Ionicons name="close" size={22} color={tokens.onMenuContainer} />,
      label: "Withdraw",
      onPress: withdraw,
    },
    {
      icon: <Ionicons name="people-outline" size={22} color={tokens.onMenuContainer} />,
      label: "Invite friends",
      onPress: inviteFriends,
    },
  ].filter(Boolean);

  const eventDate = event.startDate ? event.startDate.toDate() : event.date.toDate();
  const eventEndDate = event.endDate ? event.endDate.toDate() : null;
  // event.location is stored as a single "name - address" string — split it
  // back apart so it always renders as a name/subtitle pair, never one line.
  const locationInfo = parseLocation(event.location);
  // people.length === 0 only happens when the viewer themselves is the sole
  // attendee (otherwise "others" below would still include at least the
  // host) — show a card for them instead of empty space/placeholder text.
  const attendeesToShow = people.length === 0 && selfPerson ? [selfPerson] : people;
  const visibleAttendees = expanded ? attendeesToShow : attendeesToShow.slice(0, 3);

  return (
    <Layout>
      <SmallAppBar
        title=""
        onBack={() => navigation.goBack()}
        actions={canAct ? [{ icon: "ellipsis-vertical", onPress: () => setMenuOpen(true) }] : []}
      />

      <Menu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchor={{ top: insets.top + 64, right: 25 }}
        items={menuItems}
      />

      {loading ? (
        <EventViewSkeleton />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={event.hasImage && event.image ? { uri: event.image } : foodBackground}
            style={styles.image}
          />

          <View style={styles.titleBlock}>
            <Header2Text color={titleColor}>{event.name}</Header2Text>
            {!!event.additionalInfo && (
              <SubBodyText color={titleColor}>{event.additionalInfo}</SubBodyText>
            )}
          </View>

          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {event.tags.map((tag, index) => (
                <AboutChip key={index} text={tag.tag || tag} color={chipColorForTagType(tag.type)} />
              ))}
            </View>
          )}

          <View style={styles.infoRows}>
            {event.type === "private" && (
              <InfoRow icon="lock-closed-outline" color={infoColor}>
                Private event
              </InfoRow>
            )}
            <InfoRow icon="calendar-outline" color={infoColor} onPress={addToCalendar}>
              {formatEventDate(eventDate)}
            </InfoRow>
            <InfoRow icon="time-outline" color={infoColor}>
              {getTime(eventDate)}
              {eventEndDate ? ` - ${getTime(eventEndDate)}` : ""}
            </InfoRow>
          </View>

          <View style={styles.locationBlock}>
            <TouchableOpacity style={styles.locationRow} onPress={handleOpenMap} activeOpacity={0.7}>
              <View style={styles.locationText}>
                <Header4Text color={tokens.onBackground}>{locationInfo?.name}</Header4Text>
                {!!locationInfo?.address && (
                  <SubBodyText color={tokens.textMedium}>{locationInfo.address}</SubBodyText>
                )}
              </View>
              <Ionicons name="map-outline" size={16} color={tokens.onBackground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOpenMap} activeOpacity={0.85}>
              <StaticMapImage lat={event.locationLat} lng={event.locationLng} address={locationInfo?.address} />
            </TouchableOpacity>
          </View>

          <View style={styles.attendingSection}>
            <Header4Text color={titleColor}>Attending</Header4Text>
            <View style={styles.attendeeList}>
              {visibleAttendees.map((person) => (
                <AttendeeListItem
                  key={person.id}
                  person={person}
                  onPress={(p) => navigation.navigate("FullProfile", { person: p })}
                />
              ))}
            </View>
            {people.length > 3 && (
              <SmallTextButton
                type="Secondary"
                color={tokens.textMedium}
                text={expanded ? "Show less" : `${people.length - 3} more`}
                leadingIcon={
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={tokens.textMedium}
                  />
                }
                onPress={toggleExpanded}
              />
            )}
          </View>

          {showPhotosSection && (
            <View style={styles.photosSection}>
              <View style={styles.photosHeader}>
                <Header4Text color={titleColor}>Event photos</Header4Text>
                <TouchableOpacity
                  onPress={() =>
                    // Same galleryEventType as the listener/handleAddPhoto
                    // above, for the same reason — this must point
                    // EventGallery.js at whichever collection this event's
                    // doc (and eventGallery field) actually lives in.
                    navigation.navigate("EventGallery", { event: { ...event, type: galleryEventType } })
                  }
                >
                  <SubBodyText color={tokens.textMedium} style={styles.viewAll}>View all</SubBodyText>
                </TouchableOpacity>
              </View>

              {imageGallery.length === 0 ? (
                <TouchableOpacity
                  style={[styles.addPhotoTileFull, { borderColor: tokens.outline }]}
                  onPress={handleAddPhoto}
                >
                  <Ionicons name="add" size={35} color={tokens.outline} />
                  <Header4Text color={tokens.outline}>Add photo</Header4Text>
                </TouchableOpacity>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
                  {canManagePhotos && (
                    <TouchableOpacity
                      style={[styles.addPhotoTile, { borderColor: tokens.outline }]}
                      onPress={handleAddPhoto}
                    >
                      <Ionicons name="add" size={35} color={tokens.outline} />
                      <Header4Text color={tokens.outline}>Add photo</Header4Text>
                    </TouchableOpacity>
                  )}
                  {imageGallery.map((photo, photoIndex) => (
                    <TouchableOpacity
                      key={photo.imageId}
                      onPress={() =>
                        navigation.navigate("EventPhotoViewer", { photos: imageGallery, initialIndex: photoIndex, event })
                      }
                    >
                      <Image source={{ uri: photo.imageUrl }} style={styles.photoThumb} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {canAct && !loading && (
        <View style={[styles.footer, { backgroundColor: tokens.background, paddingBottom: insets.bottom + 8 }]}>
          {viewerRole === "host" ? (
            <>
              <LargeButton
                color="green"
                leadingIcon={<Ionicons name="chatbubbles-outline" size={16} color={tokens.onPrimary} />}
                onPress={handleEventChat}
              >
                Event chat
              </LargeButton>
              <LargeButton
                outlined
                color="green"
                leadingIcon={<Ionicons name="pencil-outline" size={16} color={tokens.primary} />}
                onPress={() => navigation.navigate("OrganizeFlow", { event })}
              >
                Edit details
              </LargeButton>
              <LargeButton
                outlined
                color={tokens.error}
                leadingIcon={<Ionicons name="trash-outline" size={16} color={tokens.error} />}
                onPress={() => setDeleteDialogVisible(true)}
              >
                Delete event
              </LargeButton>
            </>
          ) : viewerRole === "attending" ? (
            <>
              <LargeButton
                outlined
                color="green"
                leadingIcon={<Ionicons name="checkmark" size={16} color={tokens.primary} />}
                onPress={withdraw}
              >
                Attending
              </LargeButton>
              <LargeButton
                color="green"
                leadingIcon={<Ionicons name="chatbubbles-outline" size={16} color={tokens.onPrimary} />}
                onPress={handleEventChat}
              >
                Event chat
              </LargeButton>
            </>
          ) : (
            <LargeButton
              onPress={attend}
              color="green"
              leadingIcon={<FastFoodIcon size={16} color={tokens.onPrimary} />}
            >
              Attend
            </LargeButton>
          )}
        </View>
      )}

      <DialogOverlay visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog
          type="Destructive with icon"
          icon={<Ionicons name="trash-outline" size={40} color={tokens.onBackground} />}
          title="Delete event?"
          primaryButtonText="Delete"
          secondaryButtonText="Cancel"
          onPrimaryPress={handleDeleteEvent}
          onSecondaryPress={() => setDeleteDialogVisible(false)}
        >
          <SubBodyText color={tokens.onBackground} center>
            Are you sure you want to delete this event? This action cannot be undone
          </SubBodyText>
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
  },
  image: {
    height: 207,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  titleBlock: {
    gap: 6,
    width: "100%",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoRows: {
    gap: 10,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBlock: {
    gap: 15,
    width: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  locationText: {
    flexShrink: 1,
    gap: 2,
  },
  attendingSection: {
    gap: 10,
    width: "100%",
    marginTop: 10,
  },
  attendeeList: {
    gap: 10,
    width: "100%",
  },
  photosSection: {
    gap: 15,
    width: "100%",
    marginTop: 10,
  },
  photosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  viewAll: {
    opacity: 0.5,
  },
  addPhotoTileFull: {
    width: "100%",
    height: PHOTO_TILE_SIZE,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  addPhotoTile: {
    width: PHOTO_TILE_SIZE,
    height: PHOTO_TILE_SIZE,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  photosRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoThumb: {
    width: PHOTO_TILE_SIZE,
    height: PHOTO_TILE_SIZE,
    borderRadius: radiusTokens.small,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
    borderTopLeftRadius: radiusTokens.medium,
    borderTopRightRadius: radiusTokens.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 8,
  },
});

export default FullCard;
