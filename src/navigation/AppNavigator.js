// Controls navigation functionality which includes everything that involves switching screens
// Sets up login permissions

import { useEffect, useContext } from "react";
import { Alert, Linking, View, StyleSheet } from "react-native";
import "firebase/firestore";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "./useScreenOptions";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBarIcon from "../components/utils/TabBarIcon";
import EventTabButton from "../components/utils/EventTabButton";
import BottomTabBar from "../components/utils/BottomTabBar";
import AnimatedTabScreen from "../components/utils/AnimatedTabScreen";
import GenieTransitionProvider from "../components/utils/GenieTransition";
import ProfilePic from "../components/ProfilePic";
import { useTheme } from "../provider/ThemeProvider";
import { colorTokens } from "../theme/colorTokens";

// Screens (Make sure to import if ever adding new screen!)
import OrganizeMain from "../screens/Organize/OrganizeMain";
import ExploreMain from "../screens/Explore/ExploreMain";
import TryOut from "../screens/TryOut";
import ProfileMain from "../screens/Profile/ProfileMain";
import NotificationsMain from "../screens/Notifications/NotificationsMain";
import ChatMain from "../screens/Chat/ChatMain";
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
const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={useScreenOptions()}
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
  const hasUnreadMessages = auth_context.hasUnreadMessages;
  const user = auth_context.currUser;

  const { theme } = useTheme();
  const tokens = colorTokens[theme];

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
      initialRouteName="Explore"
      tabBar={(props) => <BottomTabBar {...props} />}
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
        name="Organize"
        options={{
          tabBarIcon: () => <EventTabButton />,
        }}
      >
        {(props) => {
          const Screen = user.uid == tryoutId ? TryOut : OrganizeMain;
          return (
            <AnimatedTabScreen>
              <Screen {...props} />
            </AnimatedTabScreen>
          );
        }}
      </Tabs.Screen>
      <Tabs.Screen
        name="Explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={focused ? "sparkles" : "sparkles-outline"}
              title="Explore"
            />
          ),
        }}
      >
        {(props) => (
          <AnimatedTabScreen>
            <ExploreMain {...props} />
          </AnimatedTabScreen>
        )}
      </Tabs.Screen>
      <Tabs.Screen
        name="Notifs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={focused ? "mail-open" : "mail-open-outline"}
              showBadge={hasUnreadMessages}
              title="Inbox"
            />
          ),
        }}
      >
        {(props) => {
          const Screen = user.uid == tryoutId ? TryOut : ChatMain;
          return (
            <AnimatedTabScreen>
              <Screen {...props} />
            </AnimatedTabScreen>
          );
        }}
      </Tabs.Screen>
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              focusedColor={tokens.onBackground}
              iconElement={
                <ProfilePic
                  size={32}
                  uri={profileImageUri}
                  bordered={focused}
                  ringColor={tokens.onBackground}
                />
              }
              title="Account"
            />
          ),
        }}
      >
        {(props) => {
          const Screen = user.uid == tryoutId ? TryOut : ProfileMain;
          return (
            <AnimatedTabScreen>
              <Screen {...props} />
            </AnimatedTabScreen>
          );
        }}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
};

export default () => {
  const auth_context = useContext(AuthContext);
  const user = auth_context.user;
  const currUser = auth_context.currUser;

  // NavigationContainer defaults to its own light theme (white background)
  // when no theme prop is given — react-navigation's native-stack uses
  // `colors.background` from THIS theme (not our app's own colorTokens) as
  // the base background behind every screen during a transition, which is
  // what was still showing through as a white flash in dark mode even after
  // each screen's own contentStyle was fixed.
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const navigationTheme = {
    dark: theme === "dark",
    colors: {
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.background,
      text: tokens.onBackground,
      border: tokens.outline,
      notification: tokens.error,
    },
  };

  return (
    <GenieTransitionProvider>
      <NavigationContainer theme={navigationTheme}>
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
    </GenieTransitionProvider>
  );
};
