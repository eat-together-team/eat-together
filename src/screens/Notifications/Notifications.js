// Notifications page

import React, { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import HorizontalSwitch from "../../components/HorizontalSwitch";
import MediumText from "../../components/MediumText";
import SmallText from "../../components/SmallText";
import Notification from "../../components/Notification";
import EmptyState from "../../components/EmptyState";
import Link from "../../components/Link";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";
import moment from "moment";
import { AuthContext } from "../../provider/AuthProvider";

export default function (props) {
  const user = firebase.auth().currentUser;
  const updateHasNotif = useContext(AuthContext).updateHasNotif;

  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [readNotifs, setReadNotifs] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Update hasNotif to false when page opens
    db.collection("Users").doc(user.uid).update({ hasNotif: false });
    updateHasNotif(false);

    // --- USER NOTIFICATIONS LISTENER ---
    const unsubscribeUser = db
      .collection("Users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;

        const data = snap.data();
        setUserData(data);

        const notifications = data.notifications || [];
        setNotifications(notifications);

        const newReadNotifs = [];
        const newUnreadNotifs = [];
        const newRecommendations = [];

        notifications.forEach((notif) => {
          if (notif.type === "recommendation") {
            newRecommendations.push(notif);
          } else if (notif.readAt && notif.type !== "user profile") {
            newReadNotifs.push(notif);
          } else if (!notif.readAt && notif.type !== "user profile") {
            newUnreadNotifs.push(notif);
          }
        });

        setReadNotifs(newReadNotifs.reverse());
        setUnreadNotifs(newUnreadNotifs.reverse());
        setRecommendations(newRecommendations.reverse());
      });

    // --- FRIEND REQUESTS LISTENER ---
    const unsubscribeRequests = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Connections")
      .onSnapshot((querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            username: data.username,
            profile: data.profile,
            status: data.status || "pending",
          });
        });
        setRequests(list.reverse());
      });

    setLoading(false);

    return () => {
      unsubscribeUser();
      unsubscribeRequests();
    };
  }, [user]);

  // --- Clear notifications ---
  const removeReadNotifications = async () => {
    try {
      const userDoc = await db.collection("Users").doc(user.uid).get();
      if (!userDoc.exists) return;
      const data = userDoc.data();
      const filtered = (data.notifications || []).filter((notif) => !notif.readAt);
      await db.collection("Users").doc(user.uid).update({ notifications: filtered });
      console.log("Read notifications removed");
    } catch (error) {
      console.error("Error removing read notifications:", error);
    }
  };

  const removeUnreadNotifications = async () => {
    try {
      const userDoc = await db.collection("Users").doc(user.uid).get();
      if (!userDoc.exists) return;
      const data = userDoc.data();
      const filtered = (data.notifications || []).filter((notif) => notif.readAt);
      await db.collection("Users").doc(user.uid).update({ notifications: filtered });
      console.log("Unread notifications removed");
    } catch (error) {
      console.error("Error removing unread notifications:", error);
    }
  };

  // --- Alerts ---
  const deleteAlert = () => {
    Alert.alert(
      "Delete Notifications",
      "Are you sure you want to delete all read notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => removeReadNotifications() },
      ],
      { cancelable: true }
    );
  };

  const deleteUnreadAlert = () => {
    Alert.alert(
      "Delete Notifications",
      "Are you sure you want to delete all unread notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => removeUnreadNotifications() },
      ],
      { cancelable: true }
    );
  };

  // --- UI ---
  return (
    <Layout>
      {props.fromNav ? (
        <Header name="Notifications" navigation={props.navigation} />
      ) : (
        <TopNav
          middleContent={<MediumText center>Notifications</MediumText>}
          leftContent={<Ionicons name="chevron-back" size={20} />}
          leftAction={() => props.navigation.goBack()}
        />
      )}

      {props.fromNav && (
        <HorizontalSwitch
          left="Notifications"
          right="Messages"
          current="left"
          press={() => props.navigation.navigate("ChatMain")}
          pingRight={unread}
        />
      )}

      {loading ? (
        <View style={styles.noInvitesView}>
          <ActivityIndicator size={100} color="#5DB075" />
          <MediumText>Hang tight ...</MediumText>
        </View>
      ) : notifications.length > 0 ? (
        <ScrollView style={{ padding: 5 }}>
          {/* --- Friend Requests Preview --- */}
          {requests.length > 0 && (
            <TouchableOpacity
              style={styles.friendRequestPreview}
              onPress={() => props.navigation.navigate("Requests")}
            >
              <MediumText style={styles.frTitle}>Friend Requests</MediumText>
              <View style={styles.frSubHeader}>
                <MediumText style={styles.frSub}>
                  You have {requests.length} new friend requests!
                </MediumText>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="black"
                  style={styles.rightArrow}
                />
              </View>
              <View style={styles.avatarRow}>
                {requests.slice(0, 3).map((req, index) => (
                  <Image
                    key={req.id || index}
                    source={{ uri: req.profile }}
                    style={[
                      styles.profilePic,
                      index === 0 && styles.firstProfilePic,
                    ]}
                  />
                ))}
                <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.requestText}>
                  {requests.slice(0, 3).map((r) => r.username).join(", ")}
                  {requests.length > 3 ? "..." : ""}
                </SmallText>
              </View>
            </TouchableOpacity>
          )}

          {/* --- Recommendations --- */}
          {recommendations.length > 0 && (
            <View>
              <FlatList
                contentContainerStyle={styles.cards}
                keyExtractor={(item, index) => item.id || index.toString()}
                data={recommendations}
                renderItem={({ item }) => (
                  <Notification
                    notif={item}
                    showButton={!!item.type}
                    onPress={() => {
                      if (!item.readAt) {
                        const updated = notifications.map((notif) =>
                          notif === item ? { ...notif, readAt: new Date() } : notif
                        );
                        db.collection("Users").doc(user.uid).update({
                          notifications: updated,
                        });
                      }

                      db.collection("Private Events")
                        .doc(item.id)
                        .get()
                        .then((ss) =>
                          props.navigation.navigate("Recommendation", {
                            event: ss.data(),
                            userData,
                          })
                        )
                        .catch(() =>
                          alert(
                            "There seems to be an error fetching this recommendation."
                          )
                        );
                    }}
                  />
                )}
              />
            </View>
          )}

          {/* --- Unread Notifications --- */}
          {unreadNotifs.length > 0 && (
            <View>
              <View style={styles.notifStyle}>
                <MediumText>Unread</MediumText>
                <Link onPress={deleteUnreadAlert}>Clear Notifications</Link>
              </View>

              <FlatList
                contentContainerStyle={styles.cards}
                keyExtractor={(item, index) => item.id || index.toString()}
                data={unreadNotifs}
                renderItem={({ item }) => (
                  <Notification
                    notif={item}
                    showButton={!!item.type}
                    onPress={() => {
                      if (!item.readAt) {
                        const updated = notifications.map((notif) =>
                          notif === item ? { ...notif, readAt: new Date() } : notif
                        );
                        db.collection("Users").doc(user.uid).update({
                          notifications: updated,
                        });
                      }
                      switch (item.type) {
                        case "invite":
                          db.collection("User Invites")
                            .doc(user.uid)
                            .collection("Invites")
                            .doc(item.id)
                            .get()
                            .then((ss) => {
                              const inviteToSend = { ...ss.data(), id: ss.id };
                              props.navigation.navigate("NotificationFull", {
                                invite: inviteToSend,
                                notif: item,
                                hasPassed:
                                  (ss.data().endDate
                                    ? ss.data().endDate.toDate().getTime()
                                    : ss.data().date.toDate().getTime()) <
                                  new Date().getTime(),
                              });
                            })
                            .catch(() =>
                              alert("Error fetching invite, try again later.")
                            );
                          break;
                        case "private event":
                          db.collection("Private Events")
                            .doc(item.id)
                            .get()
                            .then((ss) =>
                              props.navigation.navigate("FullCard", {
                                event: ss.data(),
                              })
                            )
                            .catch(() =>
                              alert("Error fetching this event. Try again later.")
                            );
                          break;
                        case "public event":
                          db.collection("Public Events")
                            .doc(item.id)
                            .get()
                            .then((ss) =>
                              props.navigation.navigate("FullCard", {
                                event: ss.data(),
                              })
                            )
                            .catch(() =>
                              alert("Error fetching this event. Try again later.")
                            );
                          break;
                        default:
                          alert("Sorry, an error has occurred.");
                      }
                    }}
                  />
                )}
              />
            </View>
          )}

          {/* --- Read Notifications --- */}
          {readNotifs.length > 0 && (
            <View>
              <View style={styles.notifStyle}>
                <MediumText>Read</MediumText>
                <Link onPress={deleteAlert}>Clear Notifications</Link>
              </View>

              <FlatList
                contentContainerStyle={styles.cards}
                keyExtractor={(item, index) => item.id || index.toString()}
                data={readNotifs}
                renderItem={({ item }) => (
                  <Notification
                    notif={item}
                    showButton={!!item.type}
                    onPress={() => {
                      switch (item.type) {
                        case "invite":
                          db.collection("User Invites")
                            .doc(user.uid)
                            .collection("Invites")
                            .doc(item.id)
                            .get()
                            .then((ss) => {
                              const inviteToSend = { ...ss.data(), id: ss.id };
                              props.navigation.navigate("NotificationFull", {
                                invite: inviteToSend,
                                notif: item,
                                hasPassed:
                                  (ss.data().endDate
                                    ? ss.data().endDate.toDate().getTime()
                                    : ss.data().date.toDate().getTime()) <
                                  new Date().getTime(),
                              });
                            })
                            .catch(() =>
                              alert("Error fetching invite, try again later.")
                            );
                          break;
                        case "private event":
                          db.collection("Private Events")
                            .doc(item.id)
                            .get()
                            .then((ss) =>
                              props.navigation.navigate("FullCard", {
                                event: ss.data(),
                              })
                            )
                            .catch(() =>
                              alert("Error fetching event. Try again later.")
                            );
                          break;
                        case "public event":
                          db.collection("Public Events")
                            .doc(item.id)
                            .get()
                            .then((ss) =>
                              props.navigation.navigate("FullCard", {
                                event: ss.data(),
                              })
                            )
                            .catch(() =>
                              alert("Error fetching event. Try again later.")
                            );
                          break;
                        default:
                          alert("Sorry, an error has occurred.");
                      }
                    }}
                  />
                )}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <EmptyState title="No New Notifications" text="You're all clear :)" />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  noInvitesView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  notifStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  frTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
    paddingTop: 10,
  },
  frSub: {
    marginLeft: 20,
    fontSize: 15,
  },
  rightArrow: {
    marginRight: 10,
  },
  frSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
    marginLeft: -6
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginLeft: -20,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "black",
  },
  firstProfilePic: {
    marginLeft: 25,
  },
  requestText: {
    color: "#777",
  },
});
