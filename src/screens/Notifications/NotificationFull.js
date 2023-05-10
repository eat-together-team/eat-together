import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    ImageBackground,
    Image,
    Linking
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import Button from '../../components/Button';
import BorderedButton from '../../components/BorderedButton';
import Link from "../../components/Link";

import Toggle from '../../components/Toggle';
import PeopleList from '../../components/PeopleList';

import firebase from "firebase/compat";
import { db, auth } from "../../provider/Firebase";
import getDate from '../../getDate';
import getTime from '../../getTime';
import openMap from "react-native-open-maps";

export default function ({ route, navigation }) {
    // Save the invite as a shorter name
    let invite = route.params.invite;

    const [friend, setFriend] = useState(null); // Display a friend who is also attending the event

    // See all attendees
    const [people, setPeople] = useState([]);
    const [openAttendance, setOpenAttendance] = useState(false);

    // Get the current user and firebase ref path
    const user = auth.currentUser;
    const ref = db.collection("User Invites").doc(user.uid).collection("Invites").doc(invite.id);

    useEffect(() => {
        getAttendees();
    }, []);

    // Fetch all attendees of this event
    const getAttendees = async () => {
        let table = "Private Events";
        if (invite.type === "public") {
            table = "Public Events";
        }

        await db.collection(table).doc(invite.inviteID).get().then(doc => {
            const inviteData = doc.data();
            inviteData.attendees.forEach((attendee) => {
                if (attendee !== user.uid) {
                    db.collection("Users").doc(attendee).get().then((doc) => {
                        if (doc.exists) {
                            setPeople((people) => [...people, doc.data()]);
                        }
                    });
                }
            });
            
            db.collection("Users").doc(user.uid).get().then((doc) => {
                const friend = friendAttending(doc.data(), inviteData.attendees);
                if (friend) {
                    db.collection("Users").doc(friend).get().then(doc => {
                        setFriend(doc.data());
                    });
                }
            });
        });
    };

    // Adds event to Google Calendar
    const addToCalendar = async () => {
        const details = {
            start: invite.startDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
            end: invite.endDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
            name: invite.name,
            location: invite.location,
            additionalInfo: invite.additionalInfo
        };

        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=
            ${details.name.trim()}&details=${details.additionalInfo}&location=${details.location}
            &dates=${details.start}/${details.end}`;

        Linking.openURL(calendarUrl);
    }

    // Determine if a friend is attending the event or not, and return them
    const friendAttending = (userInfo, attendees) => {
        let friend = null;
        userInfo.friendIDs.forEach(f => {
            if (attendees.includes(f) && f !== invite.hostID) {
                friend = f;
                return;
            }
        });

        return friend;
    }

    function reportInvite() {
        navigation.navigate("ReportInvite", {
            inviteID: invite.id,
        });
    }

    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText>You're Invited To:</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                rightContent={
                    <View>
                        <Menu>
                            <MenuTrigger>
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={25}
                                />
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption onSelect={() => reportInvite()} style={styles.option}>
                                    <NormalText size={18} color="red">Report Event</NormalText>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </View>
                }
                leftAction={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.page}>
                <ImageBackground
                    style={styles.imageBackground}
                    resizeMode="cover"
                    source={invite.hasImage ? {uri: invite.image} : require("../../../assets/stockEvent.png")}
                />

                <View style={styles.infoContainer}>
                    <LargeText size={24} marginBottom={10}>{invite.name}</LargeText>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={invite.hasHostImage ? {uri: invite.hostImage}
                            : require("../../../assets/logo.png")} style={styles.profileImg}/>
                        <MediumText size={18}>{invite.hostName ? invite.hostName
                            : invite.hostFirstName + " " + invite.hostLastName}
                        </MediumText>
                    </View>

                    <View style={styles.row}>
                        <NormalText>{people.length} attendee{people.length !== 1 && "s"}</NormalText>
                        {friend && <NormalText>, including: </NormalText>}
                        {friend && <Image source={friend.hasImage ? { uri: friend.image } : require("../../../assets/logo.png")} style={styles.profileImg}/>}
                        {friend && <NormalText>{friend.firstName + " " + friend.lastName.substring(0, 1) + "."}</NormalText>}
                    </View>
                    
                    <View style={styles.logistics}>
                        <View style={styles.row}>
                            <Ionicons name="location-sharp" size={20} />
                            <NormalText paddingHorizontal={10} color="black">
                                {invite.location}
                            </NormalText>
                            <Link onPress={() => openMap({ query: invite.location, provider: "google" })}>
                                (view on map)
                            </Link>
                        </View>

                        <View style={styles.row}>
                            <Ionicons name="calendar-outline" size={20} />
                            <NormalText paddingHorizontal={10} color={route.params.hasPassed ? "red" : "black"}>
                                {invite.startDate ? getDate(invite.startDate.toDate()) : getDate(invite.date.toDate())}
                            </NormalText>
                            <Link onPress={() => addToCalendar()}>
                                (add to calendar)
                            </Link>
                        </View>

                        <View style={styles.row}>
                            <Ionicons name="time-outline" size={20} />
                            <NormalText paddingHorizontal={10} color={route.params.hasPassed ? "red" : "black"}>
                                {invite.startDate ? getTime(invite.startDate.toDate()) : getTime(invite.date.toDate())}
                                {invite.endDate && " - ".concat(getTime(invite.endDate.toDate()))}
                            </NormalText>
                        </View>
                    </View>

                    <NormalText marginBottom={20} color="black">
                        {invite.description}
                    </NormalText>

                    {/* Attendance dropdown */}
                    <Toggle 
                        open={openAttendance}
                        onPress={() => setOpenAttendance(!openAttendance)}
                        title="Attendance"
                    />

                    {openAttendance && (
                        <View style={{ marginTop: 10 }}>
                            {people.length === 0 ? (
                                <NormalText paddingHorizontal={25} size={17} color="black">
                                    {"Just yourself"}
                                </NormalText>
                            ) : (
                                people.map(person => {
                                    if (person.id !== user.uid) {
                                        return (
                                            <PeopleList
                                                person={person}
                                                key={person.id}
                                                color="white"
                                                width="100%"
                                                click={() => {
                                                    navigation.navigate("FullProfile", {
                                                        person: person
                                                    });
                                                }}
                                            />
                                        );
                                    }
                                })
                            )}
                        </View>
                    )}
                </View>

                <View style = {styles.buttonView}>
                    <Button onPress = {() => {
                        const inviteRef = db.collection("Private Events").doc(invite.inviteID)
                        inviteRef.get().then((doc) => {
                        let data = doc.data()
                        let currentAttendees = data.attendees
                            currentAttendees.push(user.uid)
                            inviteRef.update({
                                attendees: currentAttendees
                            }, {merge: true}).then(() => {
                                const storeID = {
                                    type: "private",
                                    id: invite.inviteID
                                };

                                db.collection("Users").doc(user.uid).update({
                                    attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
                                    notifications: firebase.firestore.FieldValue.arrayRemove(route.params.notif)
                                }).then(() => {
                                    ref.delete().then(r => {
                                        alert("Invite accepted! Check the homepage for more details.")
                                        navigation.goBack();
                                    })
                                });
                            })


                        })
                    }} marginHorizontal={10}>
                        Accept
                    </Button>
                    <BorderedButton onPress = {() => {
                        ref.set({
                            accepted: "declined"
                        }, {merge: true}).then(() => {
                            const storeID = {
                                type: "private",
                                id: invite.inviteID
                            };

                            db.collection("Users").doc(user.uid).update({
                                attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
                                notifications: firebase.firestore.FieldValue.arrayRemove(route.params.notif)
                            }).then(() => {
                                db.collection("Private Events").doc(invite.inviteID).update({
                                    attendees: firebase.firestore.FieldValue.arrayRemove(user.uid)
                                }).then(() => {
                                    ref.delete().then(r => {
                                        alert("Invite declined. It will be removed from your notifications.");
                                        navigation.goBack();
                                    })
                                })
                            });
                        })
                    }} color="red" marginHorizontal={10}>
                        Decline
                    </BorderedButton>
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    imageBackground: {
        width: Dimensions.get("screen").width,
        height: 150,
        marginBottom: 30,
    },

    option: {
        padding: 10
    },

    infoContainer: {
        paddingHorizontal: 30
    },

    text: {
        alignItems: "flex-start",
        flexDirection: "row",
        width: Dimensions.get('screen').width - 40,
        paddingVertical: 25
    },

    profileImg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: "#5DB075",
        borderWidth: 1,
        backgroundColor: "white",
        marginRight: 3
    },

    logistics: {
        marginVertical: 15,
    },

    row: {
        flexDirection: "row",
        marginVertical: 4,
    },

    buttonView: {
        flexDirection: "row",
        alignSelf: "center",
        marginVertical: 15
    }
});