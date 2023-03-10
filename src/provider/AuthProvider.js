//Authenticates usernames and passwords using firebase implementation

import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../provider/Firebase";
const AuthContext = createContext();

const AuthProvider = (props) => {
  // user null = loading
  const [user, setUser] = useState(null);
  const [currUser, setCurrUser] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(
    "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png"
  );
  const [hasNotif, setHasNotif] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  function getProfile(u) {
    db.collection("Users")
      .doc(u.uid)
      .get()
      .then((doc) => {
        if (doc.data().hasImage) {
          setProfileImageUri(doc.data().image);
        }

        setHasNotif(doc.data().hasNotif);
      });
  }
  function checkLogin() {
    auth.onAuthStateChanged(u => {
      if (u) {
        setUser(true);
        setCurrUser(u);
        getProfile(u);
      } else {
        setUser(false);
        setCurrUser(u);
        // setUserData(null);
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        currUser,
		    profileImageUri,
        hasNotif,
        updateProfileImg: image => setProfileImageUri(image),
        updateHasNotif: notif => setHasNotif(notif),
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
