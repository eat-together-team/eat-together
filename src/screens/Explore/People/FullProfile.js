//Functionality TDB, most likely to be used to implement ice-breaker games

import React, { useEffect, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform
} from "react-native";
import { Layout, TopNav, useTheme } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import FastFoodIcon from "../../../components/icons/FastFoodIcon";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import TagsList from "../../../components/TagsList";
import Button from "../../../components/Button";
import EventCard from "../../../components/EventCard";
import NormalText from "../../../components/NormalText";
import FunFact from "../../../components/FunFact";
import GalleryRow from "../../../components/GalleryRow";
import EventsRow from "../../../components/EventsRow";
import ProfileSkeleton from "../../../components/ProfileSkeleton";
import Menu from "../../../components/Menu";
import Dialog from "../../../components/Dialog";
import DialogOverlay from "../../../components/DialogOverlay";
import SubBodyText from "../../../components/typography/SubBodyText";
// import WithBadge from "../../../components/WithBadge";

import { db, auth } from "../../../provider/Firebase";
import firebase from "firebase/compat";
import { tryoutId } from "../../../utils/constants";
import { databaseRemoveFriend } from "../../../utils/methods";
import { openDirectMessage } from "../../Chat/Chats";
import { colorTokens } from "../../../theme/colorTokens";

export const blockPerson = (uid, navigation, back) => {
  Alert.alert("Block", "Are you sure you want to block this user? This can't be undone.", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Yes", style: "destructive", onPress: () => databaseStoreBlockAction(uid, navigation, back) },
  ]);
};

const databaseStoreBlockAction = (uid, navigation, back) => {
  alert("This user has been blocked.");
  const user = auth.currentUser;

  // Update user's blacklist & remove from friends
  db.collection("Users")
    .doc(user.uid)
    .update({
      blockedIDs: firebase.firestore.FieldValue.arrayUnion(uid),
      friendIDs: firebase.firestore.FieldValue.arrayRemove(uid),
    });

  // Same thing for other user
  db.collection("Users")
    .doc(uid)
    .update({
      blockedIDs: firebase.firestore.FieldValue.arrayUnion(user.uid),
      friendIDs: firebase.firestore.FieldValue.arrayRemove(user.uid),
    });

  // Remove all chats with this user
  db.collection("Groups")
    .where("uids", "array-contains", user.uid)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.data().uids.includes(uid)) {
          db.collection("Users")
            .doc(user.uid)
            .update({
              groupIDs: firebase.firestore.FieldValue.arrayRemove(doc.id),
            });

          if (doc.data().uids.length === 2) { // If it's just a 1:1 chat, delete it
            db.collection("Users")
              .doc(uid)
              .update({
                groupIDs: firebase.firestore.FieldValue.arrayRemove(doc.id),
              });

            db.collection("Groups").doc(doc.id).delete();
          } else {
            db.collection("Groups")
            .doc(doc.id)
            .update({
              uids: firebase.firestore.FieldValue.arrayRemove(user.uid),
            });
          }
        }
      });
    });

  navigation.navigate(back);
};

const FullProfile = ({ blockBack, route, navigation }) => {
  const user = auth.currentUser; // Current user
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  // Safely destructure person with fallbacks
  const person = route?.params?.person || {};

  person.attendedEventIDs = person.attendedEventIDs || [];
  person.archivedEventIDs = person.archivedEventIDs || [];
  person.attendingEventIDs = person.attendingEventIDs || [];
  person.settings = person.settings || { banner: "#5DB075" };
  person.bio = person.bio || "";
  person.tags = person.tags || [];
  person.school = person.school || "UW-Seattle";
  person.pronouns = person.pronouns || "";


  const [status, setStatus] = useState("Loading"); // Status of connection
  const [disabled, setDisabled] = useState(true); // Disable button if already connected
  const [events, setEvents] = useState([]); // Events that this user has hosted
  const [inviterImage, setInviterImage] = useState(
    "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png"
  );
  const [personData, setPersonData] = useState(person);
  const [joinDate, setJoinDate] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]); // Up to 5 mutual connections, for the avatar row
  const [mutualCount, setMutualCount] = useState(0);
  const [messaging, setMessaging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockDialogVisible, setBlockDialogVisible] = useState(false);
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);

  const confirmBlock = () => {
    setBlockDialogVisible(false);
    databaseStoreBlockAction(person.id, navigation, blockBack);
  };

  // Unlike Block/Remove, this doesn't need a full explanation screen — the
  // dialog copy already tells the reporter what happens next, so tapping
  // Report just files it, same one-step flow as the Figma spec.
  const confirmReport = () => {
    setReportDialogVisible(false);
    db.collection("mail").add({
      to: "eat.together.team@gmail.com",
      message: {
        subject: "USER REPORT ON " + person.username + " by " + user.uid,
        text: "Reported via profile menu.",
      },
    }).then(() => {
      alert("The team has been notified of your report and will take action as soon as possible.");
    }).catch(() => alert("Couldn't submit that report, try again later."));
  };

  const confirmRemoveFriend = () => {
    setRemoveDialogVisible(false);
    databaseRemoveFriend(person.id);
    setStatus("Connect");
    setDisabled(false);
  };

  useEffect(() => {
    // updates stuff right after React makes changes to the DOM
    // STEP 1: Check if user is on your connections list.
    let thisUser = db.collection("Users").doc(user.uid);
    thisUser
      .get()
      .then((doc) => {
        let thisData = doc.data();
        // Save some images
        if (thisData.hasImage) {
          setInviterImage(thisData.image);
        }

        let requestedUser = db.collection("Users").doc(person.id);

        requestedUser.get().then((doc) => {
          let data = doc.data();
          // Update personData with fetched data including hasImage and image
          setPersonData(prev => ({
            ...prev,
            ...data,
            hasImage: data.hasImage || false,
            image: data.image || ""
          }));

          // Mutual connections — shown as an avatar row + "Friends with
          // X, Y and N more" whenever there's at least one (see spec node
          // 13-25003); with none, just the plain connection count (13-25618).
          const myFriendIDs = thisData.friendIDs || [];
          const theirFriendIDs = data.friendIDs || [];
          const mutualIDs = myFriendIDs.filter((id) => theirFriendIDs.includes(id));
          setMutualCount(mutualIDs.length);
          if (mutualIDs.length > 0) {
            Promise.all(
              mutualIDs.slice(0, 5).map((id) => db.collection("Users").doc(id).get())
            ).then((docs) => {
              setMutualFriends(docs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() })));
            });
          }

          if (thisData.friendIDs.includes(data.id)) {
            setDisabled(true);
            setStatus("Connections");
          } else {
            // STEP 2: Check if you have already requested to connect with user.
            const ref = db
              .collection("User Invites")
              .doc(data.id)
              .collection("Connections")
              .doc(user.uid);
            ref.get().then((doc) => {
              if (doc.exists) {
                setDisabled(false);
                setStatus("Pending");
              } else {
                // STEP 3: Check if user has already requested to follow you.
                const otherRef = db
                  .collection("User Invites")
                  .doc(user.uid)
                  .collection("Connections")
                  .doc(data.id);
                otherRef.get().then((doc) => {
                  if (doc.exists) {
                    setDisabled(true);
                    setStatus("Requested");
                  } else {
                    // STEP 4: Set to default
                    setDisabled(false);
                    setStatus("Connect");
                  }
                });
              }
            });
          }
        });
      })
      .then(() => {
        let list = [];
        db.collection("Public Events").onSnapshot((query) => {
          query.forEach((doc) => {
            if (
              doc.data().hostID === person.id &&
              (doc.data().endDate ? doc.data().endDate.toDate() : doc.data().date.toDate() > new Date() > new Date())
            ) {
              list.push(doc.data());
            }
          });

          list.reverse();
          setEvents(list);
        });
      });
  }, []);

  // Method for sending a connection request
  const connect = () => {
    let requestedUser = db
      .collection("Usernames")
      .doc(person.username);
    requestedUser.get().then((doc) => {
      let data = doc.data();
      db.collection("Users")
        .doc(user.uid)
        .get()
        .then((curUser) => {
          let userData = curUser.data();
          db.collection("User Invites")
            .doc(data.id)
            .collection("Connections")
            .doc(user.uid)
            .set({
              name: userData.firstName + " " + userData.lastName,
              username: userData.username,
              profile: inviterImage,
              sentAt: Date.now()
            })
            .then(() => {
              setStatus("Pending");
              setDisabled(false);
            });
        });
    });
  };

  // Withdrawing deletes the same invite doc connect() created — a still-
  // pending request just isn't accepted yet, so nothing else needs cleanup.
  const withdrawRequest = () => {
    Alert.alert(
      "Withdraw request",
      "Are you sure you want to withdraw this connection request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            db.collection("User Invites")
              .doc(person.id)
              .collection("Connections")
              .doc(user.uid)
              .delete()
              .then(() => {
                setStatus("Connect");
                setDisabled(false);
              })
              .catch(() => alert("Couldn't withdraw that request, try again later."));
          },
        },
      ]
    );
  };

  // Opens (or starts) a direct chat with this person — a normal chat if
  // already connected, otherwise a message request gated by their "Allow
  // message requests" privacy setting (defaults to on, see AccountPrivacy.js).
  const message = async () => {
    if (messaging) return;
    setMessaging(true);
    try {
      const curUserDoc = await db.collection("Users").doc(user.uid).get();
      const userData = curUserDoc.data();
      const group = await openDirectMessage(
        user,
        userData,
        { id: person.id, name: person.firstName + " " + person.lastName, username: person.username },
        status === "Connections"
      );
      navigation.navigate("ChatRoom", { group });
    } catch (error) {
      console.error("Failed to open chat:", error);
      alert("Couldn't open that chat, try again later.");
    } finally {
      setMessaging(false);
    }
  };

  const statusBarHeight = Constants.statusBarHeight || (Platform.OS === 'ios' ? 44 : 24);

  const isConnected = status === "Connections";
  const isPending = status === "Pending";
  const allowMessageRequests = personData.settings?.allowMessageRequests ?? true;
  const showMessageButton = isConnected || allowMessageRequests;

  const mutualNames = mutualFriends.map((f) => f.firstName).filter(Boolean);
  const mutualNamesText =
    mutualCount === 1
      ? mutualNames[0]
      : mutualCount === 2
      ? `${mutualNames[0]} and ${mutualNames[1]}`
      : mutualCount > 2
      ? `${mutualNames[0]}, ${mutualNames[1]} and ${mutualCount - 2} more`
      : "";

  // Menu only makes sense on someone else's profile — same guard the old
  // bottom Block/Report buttons used for the tryout demo account.
  const showPersonMenu = person.id !== user.uid && tryoutId != user.uid;
  const menuItems = [
    {
      icon: <Ionicons name="ban-outline" size={22} color={tokens.onMenuContainer} />,
      label: "Block user",
      onPress: () => setBlockDialogVisible(true),
    },
    {
      icon: <Ionicons name="alert-circle-outline" size={22} color={tokens.onMenuContainer} />,
      label: "Report user",
      onPress: () => setReportDialogVisible(true),
    },
    isConnected && {
      icon: <Ionicons name="person-remove-outline" size={22} color={tokens.onMenuContainer} />,
      label: "Remove friend",
      onPress: () => setRemoveDialogVisible(true),
    },
  ].filter(Boolean);

  if (status === "Loading") {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={[styles.palette, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ paddingTop: statusBarHeight + 124 }}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
        {/* Hero section (name/photo, connections, buttons) sizes itself to
        its own content — the blurred background is an absolute fill
        *inside* it, so it always matches exactly, whether that's one
        button, two (Connect + Message), or none. No measuring/guessing.
        paddingTop lives here (not on `page`) so the background — an
        absolute child, which ignores its own parent's padding — still
        reaches hero's true top edge and draws under the status bar, while
        the normal-flow content is pushed down below it as usual. */}
        <View style={[styles.hero, { paddingTop: statusBarHeight + 124 }]}>
          {personData.hasImage && personData.image ? (
            <ImageBackground
              source={{ uri: personData.image }}
              style={styles.background}
              imageStyle={styles.backgroundImage}
              blurRadius={20}
            />
          ) : (
            <View style={[styles.background, { backgroundColor: "#5DB075" }]} />
          )}

        {/* <View style={styles.badge}>
          <WithBadge
            mealsAttended={person.attendedEventIDs.length}
            mealsSignedUp={person.archivedEventIDs.length +
              person.attendingEventIDs.length}/>
        </View> */}

        <View style={styles.header}>
          <View style={styles.name}>
            <LargeText color="white" marginTop={4} size={((person.firstName || '') + ' ' + (person.lastName || '')).trim().length > 18 ? 18 : 24}>
              {person.firstName + " " + person.lastName}
            </LargeText>
            <NormalText color="white" weight="bold" marginBottom={10}>@{person.username}</NormalText>

            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white" marginBottom={2}>{person.school ? person.school : "UW-Seattle"}</NormalText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white" marginBottom={2}>
                {person.attendedEventIDs.length + "/" + (person.archivedEventIDs.length + person.attendingEventIDs.length) + " meals attended"}
              </NormalText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white">Joined {person.join || "June 2024"}</NormalText>
            </View>
          </View>

          <Image
            style={styles.image}
            source={
              person.hasImage
                ? { uri: person.image }
                : require("../../../../assets/logo.png")
            }
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.connections}
            onPress={() =>
              navigation.navigate("Connections", {
                viewingUser: { id: person.id, firstName: person.firstName, lastName: person.lastName },
                returnPerson: person,
              })
            }
          >
            <View style={styles.connectionsRow}>
              {mutualFriends.length > 0 && (
                <View style={styles.mutualAvatars}>
                  {mutualFriends.map((friend, i) => (
                    <Image
                      key={friend.id}
                      style={[styles.mutualAvatar, i > 0 && { marginLeft: -10 }]}
                      source={
                        friend.hasImage && friend.image
                          ? { uri: friend.image }
                          : require("../../../../assets/logo.png")
                      }
                    />
                  ))}
                  {mutualCount > mutualFriends.length && (
                    <View style={[styles.mutualAvatar, styles.mutualOverflow, { marginLeft: -10 }]}>
                      <NormalText size={9} color="black" weight="bold">
                        +{mutualCount - mutualFriends.length}
                      </NormalText>
                    </View>
                  )}
                </View>
              )}

              <View>
                <NormalText color="white" align="left" weight="bold" marginTop={8} marginBottom={mutualCount > 0 ? 0 : 8}>
                  {(personData.friendIDs || person.friendIDs || []).length} Connections
                </NormalText>
                {mutualCount > 0 && (
                  <NormalText color="white" size={11} marginBottom={8}>
                    Friends with {mutualNamesText}
                  </NormalText>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {tryoutId != user.uid && status !== "Loading" && (
          <View style={styles.links}>
            {!isConnected && (
              <TouchableOpacity
                style={[styles.followButton, isPending ? styles.followButtonOutline : styles.followButtonFilled]}
                onPress={isPending ? withdrawRequest : status === "Requested" ? undefined : connect}
                disabled={status === "Requested" ? true : disabled}
              >
                {status === "Connect" && (
                  <Ionicons name="person-add-outline" size={16} color="#646464" style={{ marginRight: 8 }} />
                )}
                <NormalText color={isPending ? "white" : "#646464"} center weight="bold">
                  {isPending ? "Connection request pending" : status === "Requested" ? "Check Requests" : "Connect"}
                </NormalText>
              </TouchableOpacity>
            )}

            {showMessageButton && (
              <TouchableOpacity
                style={[styles.followButton, styles.followButtonOutline, !isConnected && { marginTop: 10 }]}
                onPress={message}
                disabled={messaging}
              >
                <Ionicons name="chatbubble-outline" size={16} color="white" style={{ marginRight: 8 }} />
                <NormalText color="white" center weight="bold">Message</NormalText>
              </TouchableOpacity>
            )}
          </View>
        )}
        </View>

        {/* Back/food icons are direct children of `page` (not `hero`
        above), placed *after* it in the tree so they paint on top of its
        background — their `top` offset assumes a parent that doesn't
        itself get pushed down by paddingTop, which is only true one level
        up; nesting them inside hero double-shifts them down the page. */}
        <View style={[styles.palette, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={[styles.myEvents, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MyEvents", {
                userId: person.id,
                userName: person.firstName || personData?.firstName || "",
              })
            }
          >
            <FastFoodIcon size={22} color="white" />
          </TouchableOpacity>
        </View>

        {showPersonMenu && (
          <View style={[styles.menuButton, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <Menu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchor={{ top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) + 34, right: 20 }}
          items={menuItems}
        />

        <DialogOverlay visible={blockDialogVisible} onDismiss={() => setBlockDialogVisible(false)}>
          <Dialog
            type="Destructive"
            title={`Block ${person.firstName}?`}
            primaryButtonText="Block"
            secondaryButtonText="Cancel"
            onPrimaryPress={confirmBlock}
            onSecondaryPress={() => setBlockDialogVisible(false)}
          >
            <SubBodyText color={tokens.onBackground} center>
              They will not be notified, and will not be able to find your profile in the app going forward
            </SubBodyText>
          </Dialog>
        </DialogOverlay>

        <DialogOverlay visible={reportDialogVisible} onDismiss={() => setReportDialogVisible(false)}>
          <Dialog
            type="Destructive"
            title={`Report ${person.firstName}?`}
            primaryButtonText="Report"
            secondaryButtonText="Cancel"
            onPrimaryPress={confirmReport}
            onSecondaryPress={() => setReportDialogVisible(false)}
          >
            <SubBodyText color={tokens.onBackground} center>
              They will not be notified, and their profile will be sent to the Eat Together team for further review. To prevent them from interacting with your account, use the Block feature.
            </SubBodyText>
          </Dialog>
        </DialogOverlay>

        <DialogOverlay visible={removeDialogVisible} onDismiss={() => setRemoveDialogVisible(false)}>
          <Dialog
            type="Destructive"
            title="Remove friend?"
            primaryButtonText="Remove"
            secondaryButtonText="Cancel"
            onPrimaryPress={confirmRemoveFriend}
            onSecondaryPress={() => setRemoveDialogVisible(false)}
          >
            <SubBodyText color={tokens.onBackground} center>
              They will not be notified, and your connection with {person.firstName} will be removed
            </SubBodyText>
          </Dialog>
        </DialogOverlay>

        <View style={{ marginTop: 50 }}>
          <TagsList tags={person.tags} filterType="food" />
          <TagsList tags={person.tags} filterType="hobby" />
          <FunFact text={person.bio} />
          <TagsList tags={person.tags} filterType="school" />
        </View>

        {/* gallery — hidden from non-connections if the owner turned on
        "Hide gallery" in Account Privacy */}
        {personData.gallery && personData.gallery.length > 0 &&
          (!personData.settings?.hideGallery || status === "Connections") && (
          <View style={styles.galleryBackground}>
            <View style={styles.galleryHeader}>
              <NormalText>Gallery</NormalText>
              <TouchableOpacity onPress={() => navigation.navigate("Gallery", {
                userId: person.id,
                userName: person.firstName || personData?.firstName || "",
                person: personData || person,
              })
            }>
                <NormalText color="grey">View all</NormalText>
              </TouchableOpacity>
            </View>
            <GalleryRow images={personData.gallery || []} />
          </View>
        )}

        {/* events */}
        {events.length > 0 && (
          <View style={styles.eventRecordBackground} marginTop={10}>
            <View style={styles.eventsHeader}>
              <NormalText>Meetup Archive</NormalText>
              <TouchableOpacity
                onPress={() =>
                navigation.navigate("MeetupArchive", {
                  events,
                  profileName: personData?.firstName || person?.firstName || "",
                })
              }
              >
                <NormalText color="grey">View all</NormalText>
              </TouchableOpacity>
            </View>
            <EventsRow 
              events={events} 
              onEventPress={(event) => {
                navigation.navigate("FullCard", {
                  event,
                });
              }}
            />
          </View>
        )}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    alignItems: "center",
    paddingHorizontal: 10,
  },

  // Full-bleed: cancels page's paddingHorizontal so the background and
  // header content still reach the screen edges. Its own height is never
  // set explicitly — it's whatever the hero content (icons, name/photo,
  // connections, buttons) naturally lays out to, plus this bottom padding
  // (which the background fills too) for breathing room under the button(s).
  hero: {
    // No explicit width: alignSelf:'stretch' (overriding page's
    // alignItems:'center') sizes hero to page's content box *minus* its
    // margins — since those margins are negative, that subtraction adds
    // width instead, growing hero past page's padding on both sides.
    // width:'100%' instead would size hero to that content box directly,
    // leaving a gap the negative margin only repositions past, not fills.
    alignSelf: "stretch",
    marginHorizontal: -10,
    paddingBottom: 24,
  },

  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    resizeMode: "cover",
  },

  image: {
    width: 150,
    height: 150,
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 100,
    backgroundColor: "white",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -40,
  },

  palette: {
    position: "absolute",
    left: 20,
    alignItems: "center",
  },

  myEvents: {
    position: "absolute",
    right: 70,
    alignItems: "center",
  },

  menuButton: {
    position: "absolute",
    right: 20,
    alignItems: "center",
  },

  // badge: {
  //   position: "absolute",
  //   left: 20,
  //   top: 80,
  //   marginTop: 10,
  // },

  name: {
    flex: 1,
    marginRight: 20,
    marginTop: 0,
    marginBottom: 20,
    alignItems: "flex-start",
  },

  connections: {
    alignItems: "flex-start",
    paddingTop: 42,
  },

  connectionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  mutualAvatars: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  mutualAvatar: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    borderWidth: 1.5,
    borderColor: "white",
    backgroundColor: "white",
  },

  mutualOverflow: {
    alignItems: "center",
    justifyContent: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  infoIcon: {
    marginRight: 6,
  },

  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center"
  },

  links: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },

  profile: {
    fontSize: 13,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    paddingBottom: 12,
    paddingTop: 12,
    width: "95%",
  },

  followButton: {
    borderRadius: 10,
    paddingBottom: 12,
    paddingTop: 12,
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  followButtonFilled: {
    backgroundColor: "white",
  },

  followButtonOutline: {
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 2,
    // outline buttons have no vertical border padding built in above, so
    // match the filled button's visual height by trimming the same amount
    // the border adds.
    paddingBottom: 10,
    paddingTop: 10,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 16,
  },

  galleryBackground: {
    width: Dimensions.get("screen").width,
    alignItems: "center",
    paddingTop: 20,
    marginTop: 20,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
  },

  eventRecordBackground: {
    width: Dimensions.get("screen").width,
    alignItems: "center",
  },

  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
});

export default FullProfile;
