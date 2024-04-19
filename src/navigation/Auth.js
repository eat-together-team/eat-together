import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from "firebase/compat";

// Landing page
import Landing from "../screens/auth/Landing";

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

import Experiment from "../screens/Experiment";

import { db, auth, storage } from "../provider/Firebase";
import moment from "moment";

const Stack = createStackNavigator();
const Auth = () => {
  // Name.js
  // Stores the user's first name entered during registration
  const [firstName, setFirstName] = useState("");
  // Stores the user's last name entered during registration
  const [lastName, setLastName] = useState("");
  // Stores the user's age entered during registration
  const [age, setAge] = useState("");
  // Stores the user's pronouns selected during registration
  const [pronouns, setPronouns] = useState("");
  // Stores the user's biography entered during registration
  const [bio, setBio] = useState("");
  // Stores the image URI for the user's profile picture
  const [image, setImage] = useState("");
  // Stores the user's school name entered during registration
  const [school, setSchool] = useState("");

  // Tags.js
  // Stores tags related to the user's school interests
  const [schoolTags, setSchoolTags] = useState([]);
  // Stores tags related to the user's hobbies
  const [hobbyTags, setHobbyTags] = useState([]);
  // Stores tags related to the user's food preferences
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
  // Stores the chosen username during registration
  const [username, setUsername] = useState("");
  // Stores the chosen password during registration
  const [password, setPassword] = useState("");
  // Indicates whether the registration process is currently loading
  const [loading, setLoading] = useState(false);

  // Stores a list of all existing usernames to check for uniqueness
  const [usernames, setUsernames] = useState([]); // List of all usernames

  // Stores a list of user's buddies
  const [buddy, setBuddy] = useState([]); // List of all buddies

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

  // Function to create a new user account
  // It checks for username uniqueness, creates a user with email and password,
  // and stores user information in the database including handling image storage
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
      school,
      hostedEventIDs: [],
      attendingEventIDs: [],
      attendedEventIDs: [],
      archivedEventIDs: [],
      blockedIDs: [],
      buddy: [], // field for buddies 
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
      initialRouteName="Landing"
    >
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Experiment" component={Experiment} />
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
        {(props) => 
          <Email {...props}
            email={email}
            setEmail={setEmail} 
            school={school}
            setSchool={setSchool}
          />}
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
