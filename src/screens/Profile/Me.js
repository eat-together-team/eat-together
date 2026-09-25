import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform
} from "react-native";
import { Layout } from "../../rapi_ui_components";
import { Ionicons, Feather } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { db, auth } from "../../provider/Firebase";
import FastFoodIcon from "../../components/icons/FastFoodIcon";

// import WithBadge from "../../components/WithBadge";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import TagsList from "../../components/TagsList";
import EventCard from "../../components/EventCard";
import { AntDesign } from '@expo/vector-icons';
import FunFact from "../../components/FunFact";
import GalleryRow from "../../components/GalleryRow";
import RestaurantsRow from "../../components/RestaurantsRow";
import ProfileSkeleton from "../../components/ProfileSkeleton";

import { compareDates } from "../../utils/methods";
import SmallText from "../../components/SmallText";

export default function ({ navigation }) {
  const user = auth.currentUser;

  const [userInfo, setUserInfo] = useState({});
  const [banner, setBanner] = useState({});
  const [mealsAttended, setMealsAttended] = useState(0);
  const [mealsSignedUp, setMealsSignedUp] = useState(0);
  const [joinDate, setJoinDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user && user.metadata && user.metadata.creationTime) {
          const creationDate = new Date(user.metadata.creationTime);
          const month = creationDate.toLocaleString('default', { month: 'long' });
          const year = creationDate.getFullYear();
          setJoinDate(`${month} ${year}`);
        }
      } catch (error) {
        console.log("Error getting join date:", error);
      }

      await db
        .collection("Users")
        .doc(user.uid)
        .onSnapshot(async (doc) => {
          if (!doc.exists) {
            return;
          }

          setUserInfo(doc.data());
          // Firestore data arriving isn't "loaded" by itself — the hero
          // background/avatar both point at the same photo URI, which still
          // has to actually download. Swapping the skeleton out before that
          // finishes showed real layout with a blank hole where the photo
          // goes. Prefetching warms the cache both <Image>/<ImageBackground>
          // instances read from, so they paint immediately once this
          // resolves instead of popping in after.
          if (doc.data().hasImage && doc.data().image) {
            Image.prefetch(doc.data().image)
              .catch(() => {})
              .finally(() => setLoading(false));
          } else {
            setLoading(false);
          }
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

  const statusBarHeight = Constants.statusBarHeight || (Platform.OS === 'ios' ? 44 : 24);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={[styles.palette, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          ></Ionicons>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingTop: statusBarHeight + 54 }}
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
        button or two, a long name, anything. No measuring/guessing needed.
        paddingTop lives here (not on `page`) so the background — an
        absolute child, which ignores its own parent's padding — still
        reaches hero's true top edge and draws under the status bar, while
        the normal-flow content is pushed down below it as usual. */}
        <View style={[styles.hero, { paddingTop: statusBarHeight + 54 }]}>
          {userInfo.hasImage ? (
            <ImageBackground
              source={{ uri: userInfo.image }}
              style={styles.background}
              imageStyle={styles.backgroundImage}
              blurRadius={20}
            />
          ) : (
            <View style={[styles.background, { backgroundColor: '#5DB075' }]} />
          )}

          <View style={styles.header}>
            <View style={styles.name}>
              {/* ensuring that if a user has a long name, like last name, their name doesn't overflow, the text gets smaller to accommodate */}
              <LargeText color="white" marginTop={4} size={((userInfo.firstName || '') + ' ' + (userInfo.lastName || '')).trim().length > 12 ? 18 : 24}>{userInfo.firstName + " " + userInfo.lastName}</LargeText>
              <NormalText color="white" weight="bold" marginBottom={10}>@{userInfo.username}</NormalText>

              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={16} color="white" style={styles.infoIcon} />
                <NormalText color="white" marginBottom={2}>{userInfo.school ? userInfo.school : "UW Seattle"}</NormalText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="restaurant-outline" size={16} color="white" style={styles.infoIcon} />
                <NormalText color="white" marginBottom={2}>
                  {mealsAttended + "/" + mealsSignedUp + " meals attended"}
                </NormalText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="white" style={styles.infoIcon} />
                <NormalText color="white">Joined {joinDate || userInfo.join || "June 2024"}</NormalText>
              </View>
            </View>

            <Image
              style={styles.image}
              source={
                userInfo.hasImage
                  ? { uri: userInfo.image }
                  : require("../../../assets/logo.png")
              }
            />
          </View>

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.connections}
              onPress={() => {
                navigation.navigate("Connections", {
                  user: userInfo,
                  image: userInfo.image,
                  updateInfo,
                });
              }}
            >
              <NormalText color="white" align="left" weight="bold" marginTop={8} marginBottom={8}>
                {userInfo.friendIDs ? userInfo.friendIDs.length : 0} Connections</NormalText>
            </TouchableOpacity>
          </View>

          <View style={styles.links}>
            <TouchableOpacity
              style={styles.profile}
              onPress={() => {
                navigation.navigate("Edit", {
                  user: userInfo,
                  updateInfo,
                });
              }}
            >
              <Ionicons name="pencil-outline" size={16} color="white" style={{ marginRight: 8 }} />
              <NormalText color="white" center weight="bold">Edit profile</NormalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back/food/settings icons are direct children of `page` (not
        `hero` above), placed *after* it in the tree so they paint on top
        of its background — their `top` offset assumes a parent that
        doesn't itself get pushed down by paddingTop, which is only true
        one level up; nesting them inside hero double-shifts them down. */}
        <View style={[styles.palette, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          ></Ionicons>
        </View>

        {/* <View style={styles.badge}>
          <WithBadge mealsAttended={mealsAttended} mealsSignedUp={mealsSignedUp}/>
        </View> */}

        <View style={[styles.myEvents, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <TouchableOpacity onPress={() => navigation.navigate("MyEvents", { userId: user.uid })}>
            <FastFoodIcon size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.settings, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="white"
            onPress={() => {
              navigation.navigate("Settings", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          ></Ionicons>
        </View>

        {/* break down tags list */}
        <View style={{ marginTop: 20 }}>
          <TagsList tags={userInfo.tags} filterType="food" />
          <TagsList tags={userInfo.tags} filterType="hobby" />
          <FunFact text={userInfo.bio} />
          <TagsList tags={userInfo.tags} filterType="school" />
        </View>

        {/* gallery */}
        <View style={styles.galleryBackground}>
          <View style={styles.galleryHeader}>
            <NormalText>Gallery</NormalText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Gallery", { user: userInfo });
              }}
            >
              <NormalText color="grey">View all</NormalText>
            </TouchableOpacity>
          </View>
          <GalleryRow images={userInfo.gallery} />
        </View>

        {/* starred restaurants */}
        {(userInfo.starredRestaurants || []).length > 0 && (
          <View style={styles.eventRecordBackground} marginTop={20}>
            <View style={styles.eventsHeader}>
              <NormalText>Starred Restaurants</NormalText>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("StarredRestaurants", {
                    restaurants: userInfo.starredRestaurants || [],
                    isOwnProfile: true,
                  })
                }
              >
                <NormalText color="grey">View all</NormalText>
              </TouchableOpacity>
            </View>
            <RestaurantsRow
              restaurants={userInfo.starredRestaurants || []}
              onRestaurantPress={(r) =>
                navigation.navigate("StarredRestaurants", {
                  restaurants: userInfo.starredRestaurants || [],
                  isOwnProfile: true,
                  openRestaurantId: r.id,
                })
              }
            />
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
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
  // (which the background fills too) for breathing room under the button.
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
    paddingTop: 10,
  },

  name: {
    flex: 1,
    marginRight: 20,
    marginVertical: 20,
    alignItems: "flex-start",
  },

  profile: {
    fontSize: 13,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    paddingBottom: 12,
    paddingTop: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  palette: {
    position: "absolute",
    left: 20,
    alignItems: "center",
  },

  settings: {
    position: "absolute",
    right: 20,
    alignItems: "center",
  },

  myEvents: {
    position: "absolute",
    right: 70,
    alignItems: "center",
  },

  calendar: {
    position: "absolute",
    right: 20,
    top: 70,
  },

  links: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    // opacity: "70",
  },

  infoIcon: {
    marginRight: 6,
  },

  connections: {
    alignItems: "flex-start",
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
});
