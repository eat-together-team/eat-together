// Controls navigation functionality which includes everything that involves switching screens
// Sets up login permissions

import { useEffect, useContext } from "react";
import { Alert, Linking, View, StyleSheet } from "react-native";
import "firebase/firestore";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBarIcon from "../components/utils/TabBarIcon";
import TabBarText from "../components/utils/TabBarText";
import ProfilePic from "../components/ProfilePic";

// Screens (Make sure to import if ever adding new screen!)
import OrganizeMain from "../screens/Organize/OrganizeMain";
import ExploreMain from "../screens/Explore/ExploreMain";
import HomeMain from "../screens/Home/HomeMain";
import TryOut from "../screens/TryOut";
import ProfileMain from "../screens/Profile/ProfileMain";
import NotificationsMain from "../screens/Notifications/NotificationsMain";
import Loading from "../screens/utils/Loading";

// Auth screens
import Auth from "./Auth";
import { AuthContext } from "../provider/AuthProvider";

// Screen for if the user hasn't verified their email
import VerifyEmail from "../screens/VerifyEmail";
import { tryoutId } from "../utils/constants";

// Push notifications functions and imports
import * as Notifications from "expo-notifications";
import { useNotificationSync } from "../utils/notifs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

//The experience of logged in user!!
const MainStack = createStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <MainStack.Screen name="MainTabs">{() => <MainTabs />}</MainStack.Screen>
      <MainStack.Screen name="Notifications" component={NotificationsMain} />
    </MainStack.Navigator>
  );
};


//Controls the screens connected to the bottom navigation bar
const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  const auth_context = useContext(AuthContext);
  const profileImageUri = auth_context.profileImageUri;
  const hasNotif = auth_context.hasNotif;
  const user = auth_context.currUser;

  const { syncNotificationSettings } = useNotificationSync(user.uid);

  // Prevent unnecessary reloads of data
  useEffect(() => {
    async function checkNotificationPermissions() {
      const { status } = await Notifications.getPermissionsAsync();

      // Prompt user if permissions are still not granted
      if (status === "denied") {
        Alert.alert(
          "Push Notification Disabled",
          "Push notifications for Eat Together have been disabled in Settings. Would you like to open settings and enable them now?",
          [
            {
              text: "Yes",
              onPress: () => {
                  Linking.openSettings();
              },
              style: "cancel"
            },
            {
              text: "No",
              onPress: () => {}
            }
          ]
        );
      }
    }

    checkNotificationPermissions();
  }, []);

  return (
    <Tabs.Navigator
      initialRouteName={user.uid === tryoutId ? "Explore" : "Home"}
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#ffffff" }]} />
        ),
        sceneContainerStyle: { backgroundColor: "#ffffff" },      }}
    >
      <Tabs.Screen
        name="Home"
        component={user.uid == tryoutId ? TryOut : HomeMain}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"home-outline"} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        component={ExploreMain}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={"compass-outline"}
              title="Explore"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Organize"
        component={user.uid == tryoutId ? TryOut : OrganizeMain}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={"create-outline"}
              title="Organize"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Notifs"
        component={user.uid == tryoutId ? TryOut : NotificationsMain}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Inbox" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={hasNotif ? "mail-unread-outline" : "mail-outline"}
              title="Inbox"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={user.uid == tryoutId ? TryOut : ProfileMain}
        options={{
          tabBarIcon: () => <ProfilePic size={38} uri={profileImageUri} />,
        }}
      />
    </Tabs.Navigator>
  );
};

export default () => {
  const auth_context = useContext(AuthContext);
  const user = auth_context.user;
  const currUser = auth_context.currUser;

  return (
    <NavigationContainer>
      {user === null && <Loading />}
      {user === false && <Auth />}
      {user === true &&
        currUser &&
        !currUser.emailVerified &&
        currUser.email !== "rachelhu@uw.edu" &&
        currUser.email !== "calebcile@gmail.com" ? (
          <VerifyEmail setCurrUser={auth_context.setCurrUser}/>
        ) : (
          user === true && <Main />
        )
      }
    </NavigationContainer>
  );
};
