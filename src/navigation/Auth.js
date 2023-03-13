import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from "firebase/compat";

// Login and forgot password pages
import Login from "../screens/auth/Login";
import ForgetPassword from "../screens/auth/ForgetPassword";

// Sign-up pages
import Name from "../screens/auth/Registration/Name";
import Email from "../screens/auth/Registration/Email";
import Tags from "../screens/auth/Registration/Tags";
import Password from "../screens/auth/Registration/Password";

import AvailabilitiesHome from "../screens/auth/Registration/AvailabilitiesHome";
import Availabilities from "../screens/auth/Registration/Availabilities";
import Day from "../screens/auth/Registration/Day";

import { db, auth, storage } from "../provider/Firebase";
import moment from "moment";

const Stack = createStackNavigator();
const Auth = () => {
  // Name.js
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  // Tags.js
  const [schoolTags, setSchoolTags] = useState([]);
  const [hobbyTags, setHobbyTags] = useState([]);
  const [foodTags, setFoodTags] = useState([]);

  // Email.js
  const [email, setEmail] = useState("");

  // Days
  const [monday, setMonday] = useState([]);
  const [tuesday, setTuesday] = useState([]);
  const [wednesday, setWednesday] = useState([]);
  const [thursday, setThursday] = useState([]);
  const [friday, setFriday] = useState([]);
  const [saturday, setSaturday] = useState([]);
  const [sunday, setSunday] = useState([]);

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

    if (usernames.includes(username)) {
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

    const newTimes = convertToDate([monday, tuesday, wednesday, thursday, friday, saturday, sunday]);

    // Initialize user data
    const userData = {
      id: uid,
      firstName,
      lastName,
      username,
      email,
      age: parseInt(age),
      hasImage: image !== "",
      image,
      tags,
      pronouns,
      bio,
      hostedEventIDs: [],
      attendingEventIDs: [],
      attendedEventIDs: [],
      archivedEventIDs: [],
      blockedIDs: [],
      friendIDs: [],
      groupIDs: [],
      availabilities: {
        monday: newTimes[0],
        tuesday: newTimes[1],
        wednesday: newTimes[2],
        thursday: newTimes[3],
        friday: newTimes[4],
        saturday: newTimes[5],
        sunday: newTimes[6],
      },
      notifications: [],
      metWith: [],
      metAt: [],
      settings: {
        notifications: true,
      },
      hasNotif: true,
      pushTokens: [],
      verified: false,
    };

    await db.collection("Users").doc(`${uid}`).set(userData);
    await db.collection("Usernames").doc(userData.username).set({
      id: uid,
    });
  };
  
  // Convert from moment to firebase timestamp
  const convertToDate = (days) => {
    let newList = [];
    days.forEach(list => {
      let newDay = [];
      list.forEach(time => {
        newDay.push({
          startTime: moment(time.startTime).toDate(),
          endTime: moment(time.endTime).toDate()
        });
      });

      newList.push(newDay);
    });

    return newList;
  }

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
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />

      <Stack.Screen name="Name" options={{ headerShown: false }}>
        {(props) => (
          <Name
            {...props}
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            age={age}
            setAge={setAge}
            bio={bio}
            setBio={setBio}
            image={image}
            setImage={setImage}
            pronouns={pronouns}
            setPronouns={setPronouns}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Tags" options={{ headerShown: false }}>
        {(props) => (
          <Tags
            {...props}
            schoolTags={schoolTags}
            setSchoolTags={setSchoolTags}
            hobbyTags={hobbyTags}
            setHobbyTags={setHobbyTags}
            foodTags={foodTags}
            setFoodTags={setFoodTags}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Email" options={{ headerShown: false }}>
        {(props) => <Email {...props} email={email} setEmail={setEmail} />}
      </Stack.Screen>

      <Stack.Screen
        name="AvailabilitiesHome"
        options={{ headerShown: false }}
        component={AvailabilitiesHome}
      />
      <Stack.Screen
        name="Availabilities"
        options={{ headerShown: false }}
      >
        {(props) => <Availabilities {...props} monday={monday} setMonday={setMonday} tuesday={tuesday} setTuesday={setTuesday}
          wednesday={wednesday} setWednesday={setWednesday} thursday={thursday} setThursday={setThursday}
          friday={friday} setFriday={setFriday} saturday={saturday} setSaturday={setSaturday} sunday={sunday} setSunday={setSunday} />}
      </Stack.Screen>
      <Stack.Screen name="Day" options={{ headerShown: false }} component={Day}/>
        
      <Stack.Screen name="Password" options={{ headerShown: false }}>
        {(props) => (
          <Password
            {...props}
            username={username}
            setUsername={setUsername}
            usernames={usernames}
            password={password}
            setPassword={setPassword}
            createUser={createUser}
            loading={loading}
            email={email}
            setEmail={setEmail}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default Auth;
