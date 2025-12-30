// This is the colorpicker for banner color, it will allow user
// to click and pick a color and set the chosen color to be their
// new banner color and also update the database
import { TriangleColorPicker } from 'react-native-color-picker'
import React from "react";
import { Ionicons} from "@expo/vector-icons";
import MediumText from "../../components/MediumText";
import {
    View,
} from 'react-native';

import { db, auth } from "../../provider/Firebase";
import "firebase/firestore"

export default function Colorpicker({ navigation, route }) {
  const user = auth.currentUser;

  return (
    <View style={{flex: 1, padding: 45, backgroundColor: 'black'}}>
      <Ionicons
        name="chevron-back"
        size={40}
        color="white"
        onPress={() => {
          navigation.navigate("Me");
        }}
      />
      <MediumText color="white">Rotate the palette and click the right side of the bar below to save your new banner color!</MediumText>
      <TriangleColorPicker
        oldColor={route.params.oldbanner}
        onColorSelected={color => {
          db.collection("Users").doc(user.uid).update({
              "settings.banner": color
          });
        }}
        onOldColorSelected={color => {
          db.collection("Users").doc(user.uid).update({
              "settings.banner": route.params.oldbanner
          });
        }}
        style={{flex: 1}}
      />
    </View>
  );
}