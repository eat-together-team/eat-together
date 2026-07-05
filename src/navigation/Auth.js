import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import firebase from "firebase/compat";

// Landing page
import Landing from "../screens/auth/Landing";

// Login and forgot password pages
import Login from "../screens/auth/Login";
import ForgetPassword from "../screens/auth/ForgetPassword";

// Sign-up pages
import CreateAccountFlow from "../screens/auth/Registration/CreateAccountFlow";
import EditUserTags from "../screens/auth/Registration/EditUserTags";

import Experiment from "../screens/Experiment";

import { db, auth, storage } from "../provider/Firebase";

import ExploreCopy from "../screens/Experiment/ExploreCopy";

const Stack = createNativeStackNavigator();
const Auth = () => {
  // Name.js
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [school, setSchool] = useState("");

  // Tags.js
  const [schoolTags, setSchoolTags] = useState([]);
  const [hobbyTags, setHobbyTags] = useState([]);
  const [foodTags, setFoodTags] = useState([]);

  // Email.js
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");

  // Password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernames, setUsernames] = useState([]); // List of all usernames

  useEffect(() => {
    db.collection("Usernames")
      .get()
      .then((querySnapshot) => {
        let usernameList = [];

        querySnapshot.forEach((doc) => {
          usernameList.push(doc.id);
        });

        setUsernames(usernameList);
      });
  }, []);

  const createUser = async () => {
    setLoading(true);
    const derivedUsername = email.split('@')[0];

    if (usernames.includes(derivedUsername)) {
      setLoading(false);
      alert("Your username has already been picked, choose another one :(");
    } else {
      try {
        const response = await firebase.auth().createUserWithEmailAndPassword(
          email,
          password
        );

        if (response.user.uid) {
          const { uid } = response.user;

          if (image !== "") {
            storeImage(image, uid).then(() => {
              fetchImage(uid).then((uri) => {
                makeUser(uid, uri).then(() => {
                  response.user.sendEmailVerification();
                });
              });
            });
          } else {
            makeUser(uid, "").then(() => {
              response.user.sendEmailVerification();
            });
          }
        } else {
          alert("Something went wrong, please try again.");
        }
      } catch (error) {
        alert(error.message);
        setLoading(false);
      }
    }
  };

  const makeUser = async (uid, image) => {
    // Create new objects for each tag
    let tags = [];
    schoolTags.forEach((tag) => {
      tags.push({
        tag: tag,
        type: "school",
      });
    });

    hobbyTags.forEach((tag) => {
      tags.push({
        tag: tag,
        type: "hobby",
      });
    });

    foodTags.forEach((tag) => {
      tags.push({
        tag: tag,
        type: "food",
      });
    });

    // Initialize user data
    const derivedUsername = email.split('@')[0];
    const userData = {
      id: uid,
      firstName,
      lastName,
      username: derivedUsername,
      email,
      age: parseInt(age),
      hasImage: image !== "",
      image,
      tags,
      pronouns,
      bio,
      school: campus || school,
      hostedEventIDs: [],
      attendingEventIDs: [],
      attendedEventIDs: [],
      archivedEventIDs: [],
      blockedIDs: [],
      friendIDs: [],
      groupIDs: [],
      notifications: [],
      metWith: [],
      metAt: [],
      settings: {
        tabsTutorial: true,
        attendingTutorial: true,
        attendingEvent: false,
        completedTutorial: false,
        getRecommendations: true
      },
      hasNotif: false,
      pushTokens: [],
      verified: false,
      tutorial: true,
    };

    await db.collection("Users").doc(`${uid}`).set(userData);
    await db.collection("Usernames").doc(userData.username).set({
      id: uid,
    });
  };
  

  // Stores image in Firebase Storage
  const storeImage = async (uri, id) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    var ref = storage.ref().child("profilePictures/" + id);
    return ref.put(blob);
  };

  // Fetches image from Firebase Storage
  const fetchImage = async (id) => {
    let ref = storage.ref().child("profilePictures/" + id);
    return ref.getDownloadURL();
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
      }}
      initialRouteName="Landing"
    >
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Experiment" component={Experiment} />
      <Stack.Screen name="ExploreCopy" component={ExploreCopy} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />

      <Stack.Screen name="CreateAccountFlow" options={{ headerShown: false }}>
        {(props) => (
          <CreateAccountFlow
            {...props}
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            pronouns={pronouns}
            setPronouns={setPronouns}
            image={image}
            setImage={setImage}
            bio={bio}
            setBio={setBio}
            foodTags={foodTags}
            setFoodTags={setFoodTags}
            hobbyTags={hobbyTags}
            setHobbyTags={setHobbyTags}
            schoolTags={schoolTags}
            setSchoolTags={setSchoolTags}
            email={email}
            setEmail={setEmail}
            campus={campus}
            setCampus={setCampus}
            password={password}
            setPassword={setPassword}
            createUser={createUser}
            loading={loading}
            username={username}
            setUsername={setUsername}
            usernames={usernames}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="EditUserTags" options={{ headerShown: false }} component={EditUserTags} />
    </Stack.Navigator>
  );
};

export default Auth;
