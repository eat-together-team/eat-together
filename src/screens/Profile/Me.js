import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  FlatList
} from "react-native";
import { Layout, Button as RapiButton } from "react-native-rapi-ui";
import { Ionicons, Feather } from "@expo/vector-icons";
import { db, auth, storage } from "../../provider/Firebase";

import Button from "../../components/Button";
import WithBadge from "../../components/WithBadge";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import TagsList from "../../components/TagsList";
import EventCard from "../../components/EventCard";
import { AntDesign } from '@expo/vector-icons';

import { compareDates } from "../../utils/methods";
import ArchiveList from "../../components/ArchiveList";
import GalleryList from "../../components/GalleryList";

export default function ({ navigation }) {
  const user = auth.currentUser;

  const [userInfo, setUserInfo] = useState({});
  const [banner, setBanner] = useState({});
  const [mealsAttended, setMealsAttended] = useState(0);
  const [mealsSignedUp, setMealsSignedUp] = useState(0);

  const [events, setEvents] = useState([]);
  const [friends, setFriends] = useState([]);

  const screenWidth = Dimensions.get('window').width;
  const nameFontSize = screenWidth > 350 ? 24 : 20;
  const pronounFontSize = screenWidth > 350 ? 18 : 15;

  useEffect(() => {
    async function fetchData() {
      await db
        .collection("Users")
        .doc(user.uid)
        .onSnapshot(async (doc) => {
          if (!doc.exists) {
            return;
          }

          setUserInfo(doc.data());
          if (doc.data().settings.banner) {
            setBanner(doc.data().settings.banner);
          } else {
            db.collection("Users").doc(user.uid).update({
              "settings.banner": '#5DB075'
            });
            setBanner('#5DB075')
          }
          setMealsAttended(doc.data().attendedEventIDs.length);
          setMealsSignedUp(
            doc.data().attendingEventIDs.length +
            doc.data().archivedEventIDs.length
          );

          const friendIDs = doc.data().friendIDs || [];
          let promises = friendIDs.map(async (uid) => {
            const userRef = db.collection('Users').doc(uid);
            const userSnap = await userRef.get();
            if (userSnap.exists) {
              const data = userSnap.data();
              let image = data.hasImage ? data.image : require("../../../assets/logo.png");
              return {
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                image,
                hasImage: data.hasImage
              };
            }
            return null;
          });
          Promise.all(promises).then(list => {
            setFriends(list.filter(Boolean));
          });

          let newEvents = [];
          let eventsLength = doc.data().archivedEventIDs.length;

          doc.data().archivedEventIDs.forEach(async (e) => {
            let table = "Public Events";
            if (e.type === "private") {
              table = "Private Events";
            }

            await db.collection(table)
              .doc(e.id)
              .get()
              .then((event) => {
                let data = event.data();
                data.type = e.type;
                newEvents.push(data);
                eventsLength--;

                if (eventsLength === 0) {
                  // Sort events by date
                  newEvents = newEvents.sort((a, b) => {
                    return -compareDates(a, b);
                  });

                  setEvents(newEvents);
                }
              }).catch(e => {
                // Still activates after logout for some accounts, commented for now
                // alert("There was an error fetching some of your meals :( try again later");

                eventsLength--;
                newEvents = newEvents.sort((a, b) => {
                  return -compareDates(a, b);
                });

                setEvents(newEvents);
              });
          });
        });
    }

    fetchData();
  }, []);

  // For selecting a photo
  const handleChoosePhoto = async () => {
      Alert.alert (
          "Pick Image",
          "Choose an image for your profile",
          [
              {
                  text: "Gallery",
                  onPress: () => galleryImageSelector(),
              },
              { text: "Take a photo", onPress: () => cameraImageSelector() },
          ],
          { cancelable: false}
      );
  };

  // For selecting a photo from gallery
  const galleryImageSelector = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
    });
    if (!result.cancelled) {
        setPhoto(result.assets[0].uri);
    }
  };

  // For selecting a photo by capturing an image with camera
  const cameraImageSelector = async () => {
      try {
          await ImagePicker.requestCameraPermissionsAsync({});
          let result = await ImagePicker.launchCameraAsync({
              cameraType: ImagePicker.CameraType.back,
              allowsEditing: true,
              quality: 1,
          });
          if (!result.cancelled) {
              setPhoto(result.assets[0].uri);
          }
      } catch (error) {
          alert("Error uploading message: " + error.message);
      }
  };

  // Update user profile after editing
  const updateInfo = (newFirstName, newLastName, newPronouns, newBio, newTags, newImage) => {
    setUserInfo((prev) => ({
      ...prev,
      firstName: newFirstName,
      lastName: newLastName,
      pronouns: newPronouns,
      bio: newBio,
      tags: newTags,
      image: newImage,
    }));
  };

  // Update user's availabilities after editing
  const updateAvailabilities = newAvailabilities => {
    setUserInfo(prev => ({
      ...prev,
      availabilities: newAvailabilities
    }));
  }

  // Update user's banner after editing
  const updateBanner = newBanner => {
    setBanner(() => ({
      banner: newBanner
    }));
  }

  const avatarSource = userInfo.hasImage
    ? { uri: userInfo.image }
    : require("../../../assets/logo.png");

  const images = userInfo.gallery;

  return (
    <ImageBackground
      source={avatarSource}
      style={{ flex: 1 }}
      blurRadius={20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.settings}>
          <Ionicons
            name="settings-sharp"
            size={28}
            color="white"
            onPress={() => {
              navigation.navigate("Settings", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          />
        </View>
        <View
          style={[
            styles.rowInfoBlock,
            {
              justifyContent: 'center',
              marginTop: 32,
              marginBottom: 12,
            },
          ]}
        >
          <View
            style={{
              position: "relative",
              width: 100,
              height: 100,
              marginRight: 29,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              style={styles.image}
              source={avatarSource}
            />
          </View>
          <View style={styles.infoBlock}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginBottom: 2,
                minWidth: 0,
              }}
            >
              <LargeText
                style={styles.name}
                numberOfLines={1}
                ellipsizeMode="tail"
                size={nameFontSize}
              >
                {userInfo.firstName + " " + userInfo.lastName}
              </LargeText>
              {userInfo.pronouns ? (
                <NormalText
                  style={{
                    color: 'white',
                    marginLeft: 8,
                    fontWeight: '400',
                    textAlign: 'left',
                    lineHeight: 30,
                    flexShrink: 0,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  size={pronounFontSize}
                >
                  {userInfo.pronouns}
                </NormalText>
              ) : null}
            </View>
            <NormalText
              size={16}
              style={{
                color: 'white',
                textAlign: 'left',
              }}
            >
              @{userInfo.username}
            </NormalText>
            <NormalText
              marginBottom={2}
              style={{
                color: 'white',
                textAlign: 'left',
              }}
            >
              🏫 {userInfo.school ? userInfo.school : "UW-Seattle"}
            </NormalText>
            <NormalText
              style={{
                color: 'white',
                textAlign: 'left',
                marginBottom: 8,
              }}
            >
              🍽️ {mealsAttended + "/" + mealsSignedUp + " meals attended"}
            </NormalText>
            <Button
              style={[
                styles.baseOutlineButton,
                { paddingHorizontal: 22, alignSelf: 'flex-start', marginTop: 2 },
              ]}
              fontSize={14}
              onPress={() => {
                navigation.navigate("Edit", {
                  user: userInfo,
                  updateInfo,
                });
              }}
            >
              Edit Profile
            </Button>
          </View>
        </View>
        <LargeText
          style={[styles.name, { left: 18 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          size={nameFontSize}
        >
          {userInfo.firstName + " " + userInfo.lastName}
        </LargeText>

        {userInfo.bio ? (
          <NormalText style={styles.bio}>
            {userInfo.bio}
          </NormalText>
        ) : null}

        <TagsList
          tags={userInfo.tags || []}
          style={{ marginLeft: 18 }}
          marginVertical={0}
        />

        {friends.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginLeft: 18,
              marginTop: 12,
            }}
          >
            {/* profile photos */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {friends.slice(0, 4).map((f, idx) => (
                <Image
                  key={f.id}
                  source={f.hasImage ? { uri: f.image } : require("../../../assets/logo.png")}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: '#A5D6A7',
                    marginLeft: idx === 0 ? 0 : -12,
                    backgroundColor: '#fff',
                  }}
                />
              ))}
              {friends.length > 4 && (
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#8BC48A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: -12,
                }}>
                  <NormalText
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}
                  >
                    +{friends.length - 4}
                  </NormalText>
                </View>
              )}
            </View>
            {/* name lists */}
            <NormalText
              style={{
                color: 'white',
                marginLeft: 8,
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              Friends with {friends.slice(0, 2).map((f, i) => (
                <NormalText
                  key={f.id}
                  style={{
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: 13,
                  }}
                >
                  {f.firstName}{i === 0 && friends.length > 1 ? ', ' : ''}
                </NormalText>
              ))}
              {friends.length > 2 ? ` and ${friends.length - 2} more` : ''}
            </NormalText>
          </View>
        )}
        {friends.length === 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 18,
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            <NormalText
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              No connections yet—add a friend!
            </NormalText>
          </View>
        )}
        <Button
          style={[
            styles.baseOutlineButton,
            { paddingHorizontal: 21, alignSelf: 'flex-end', marginTop: 0, right: 18 },
          ]}
          fontSize={14}
          onPress={() => {
            navigation.navigate("Connections", {
              user: userInfo,
              image: userInfo.image,
              updateInfo,
            });
          }}
        >
          Connections
        </Button>
        <View style={styles.card}>
          <LargeText style={styles.cardHeader}>Photos</LargeText>
          <GalleryList
            images={images}
            style={{ marginLeft: 18 }}
            marginVertical={0}
          />
          <LargeText style={styles.cardHeader}>Archives</LargeText>
          <ArchiveList
            archives={events}
            style={{ marginLeft: 18, marginBottom: 12 }}
            marginVertical={0}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 120,
    borderColor: "white",
    borderWidth: 4,
    borderRadius: 100,
    backgroundColor: "white",
  },

  name: {
    width: "100%",
    marginVertical: 20,
    alignItems: "center",
  },

  palette: {
    position: "absolute",
    left: 20,
    top: 20,
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    left: 20,
    top: 70,
    marginTop: 10,
  },

  settings: {
    position: "absolute",
    right: 20,
    top: 20,
    alignItems: "center",
  },

  baseOutlineButton: {
    paddingVertical: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
  },
  
  rowInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 12,
  },

  name: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    lineHeight: 34,
    flexShrink: 1,
    minWidth: 0,
  },

  bio: {
    color: 'white',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 3,
    textAlign: 'left',
    width: '100%',
    left: 20,
  },

  card: {
    marginTop: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 400,
    padding: 0,
    flexGrow: 1,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
  },

  cardHeader: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 12,
    marginTop: 25,
    left: 18
  },
});
