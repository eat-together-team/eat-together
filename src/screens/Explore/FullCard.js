// Full event page ("View Event")

import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Linking, LayoutAnimation } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Layout, useTheme } from "../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";

import SmallAppBar from "../../components/SmallAppBar";
import LargeButton from "../../components/LargeButton";
import SmallTextButton from "../../components/SmallTextButton";
import AboutChip from "../../components/AboutChip";
import AttendeeListItem from "../../components/AttendeeListItem";
import EventViewSkeleton from "../../components/EventViewSkeleton";
import Menu from "../../components/Menu";
import Header2Text from "../../components/typography/Header2Text";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";

import getTime from "../../utils/getTime";
import { pickAndUploadEventPhoto } from "../../utils/eventGallery";

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

  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [imageGallery, setImageGallery] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

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
      })
      .then(() => getAttendees())
      .then(() => setLoading(false));
  }, []);

  // Live photo gallery preview — lets the "Event photos" row update as soon
  // as someone adds a photo, without leaving this screen.
  useEffect(() => {
    const unsubscribe = db.collection("Public Events").doc(event.id).onSnapshot((doc) => {
      const data = doc.data();
      setImageGallery((data && data.eventGallery) || []);
    });

    return () => unsubscribe();
  }, [event.id]);

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
        navigation.goBack();
        alert("You withdrew :(");
      });
    });
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

  const handleAddPhoto = () => {
    pickAndUploadEventPhoto(event, user).catch((error) => {
      console.error("Image upload failed: ", error);
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
  const showPhotosSection = viewerRole === "attending" || (viewerRole === "guest" && imageGallery.length > 0);

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
  const visibleAttendees = expanded ? people : people.slice(0, 3);

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

          <View style={styles.locationRow}>
            <Header4Text color={tokens.onBackground} style={styles.locationText} numberOfLines={2}>
              {event.location}
            </Header4Text>
            <TouchableOpacity
              onPress={() => openMap({ query: event.location, provider: "google" })}
              hitSlop={8}
            >
              <Ionicons name="map-outline" size={16} color={tokens.onBackground} />
            </TouchableOpacity>
          </View>

          <View style={styles.attendingSection}>
            <Header4Text color={titleColor}>Attending</Header4Text>
            {people.length === 0 ? (
              <SubBodyText color={tokens.textMedium}>Just yourself</SubBodyText>
            ) : (
              <>
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
              </>
            )}
          </View>

          {showPhotosSection && (
            <View style={styles.photosSection}>
              <View style={styles.photosHeader}>
                <Header4Text color={titleColor}>Event photos</Header4Text>
                <TouchableOpacity onPress={() => navigation.navigate("EventGallery", { event })}>
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
                  {viewerRole === "attending" && (
                    <TouchableOpacity
                      style={[styles.addPhotoTile, { borderColor: tokens.outline }]}
                      onPress={handleAddPhoto}
                    >
                      <Ionicons name="add" size={35} color={tokens.outline} />
                      <Header4Text color={tokens.outline}>Add photo</Header4Text>
                    </TouchableOpacity>
                  )}
                  {imageGallery.map((photo) => (
                    <Image key={photo.imageId} source={{ uri: photo.imageUrl }} style={styles.photoThumb} />
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {canAct && !loading && (
        <View style={[styles.footer, { backgroundColor: tokens.background, paddingBottom: insets.bottom + 20 }]}>
          {viewerRole === "host" ? (
            <>
              {/* Not wired up yet — needs an Edit event flow + delete-event confirmation before this PRs. */}
              <LargeButton
                outlined
                color={tokens.outline}
                leadingIcon={<Ionicons name="pencil-outline" size={16} color={tokens.outline} />}
                onPress={() => {}}
              >
                Edit details
              </LargeButton>
              <LargeButton
                outlined
                color={tokens.error}
                leadingIcon={<Ionicons name="trash-outline" size={16} color={tokens.error} />}
                onPress={() => {}}
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
              {/* Stubbed — no event-chat feature exists yet to navigate to. */}
              <LargeButton
                color="green"
                leadingIcon={<Ionicons name="chatbubbles" size={16} color={tokens.onPrimary} />}
                onPress={() => {}}
              >
                Event chat
              </LargeButton>
            </>
          ) : (
            <LargeButton
              onPress={attend}
              color="green"
              leadingIcon={<Ionicons name="fast-food" size={16} color={tokens.onPrimary} />}
            >
              Attend
            </LargeButton>
          )}
        </View>
      )}
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  locationText: {
    flexShrink: 1,
  },
  attendingSection: {
    gap: 10,
    width: "100%",
  },
  attendeeList: {
    gap: 10,
    width: "100%",
  },
  photosSection: {
    gap: 10,
    width: "100%",
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
