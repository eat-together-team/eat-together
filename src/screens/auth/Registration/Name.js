// First page of registration

import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { Feather } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';

import TextInput from "../../../components/TextInput";
import LargeText from "../../../components/LargeText";
import Button from "../../../components/Button";
import KeyboardAvoidingWrapper from "../../../components/KeyboardAvoidingWrapper";

import { checkProfanity } from "../../../methods";
import NormalText from "../../../components/NormalText";

const Name = props => {
  // Input fields
  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);
  const [age, setAge] = useState(props.age);
  const [pronouns, setPronouns] = useState(props.pronouns);
  const [bio, setBio] = useState(props.bio);
  const [image, setImage] = useState(props.image);

  const goNext = () => {
    if (checkProfanity(firstName) || checkProfanity(lastName)) {
      alert("Name has inappropriate words >:(");
    } else if (checkProfanity(pronouns)) {
      alert("Pronouns have inappropriate words >:(");
    } else if (checkProfanity(bio)) {
      alert("Fun fact has inappropriate words >:(");
    } else {
      props.setFirstName(firstName);
      props.setLastName(lastName);
      props.setPronouns(pronouns);
      props.setAge(age);
      props.setBio(bio);
      props.setImage(image);
      props.navigation.navigate("Tags");
    }
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  }

  return (
    <SafeAreaView>
      <KeyboardAvoidingWrapper>
        <View>
          <View style={styles.header}>
            <LargeText color="white" center size={25}>
              Let's set up your profile!
            </LargeText>
          </View>

          <View style={styles.imageContainer}>
            {image !== "" ? (
              <Image style={styles.image} source={{ uri: image }} />
            ) : (
              <Image
                style={styles.image}
                source={require("../../../../assets/logo.png")}
              />
            )}
            <TouchableOpacity style={styles.editImage} onPress={pickImage}>
              <Feather name="edit-2" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <TextInput
                placeholder="First name"
                value={firstName}
                width = "47%"
                height = "100%"
                onChangeText={(val) => setFirstName(val)}
                iconLeft = "person"
                autoComplete="name"
              />
              <TextInput
                placeholder="Last name"
                value={lastName}
                width = "47%"
                height = "100%"
                onChangeText={(val) => setLastName(val)}
                iconLeft = "person"
                autoComplete="name"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                placeholder="Age"
                value={age}
                width="47%"
                height="100%"
                onChangeText={(val) => setAge(val)}
                iconLeftType="Ionicons"
                iconLeft="md-pencil"
                keyboardType="numeric"
              />

              <TextInput
                placeholder="Pronouns"
                value={pronouns}
                width="47%"
                height="100%"
                onChangeText={(val) => setPronouns(val)}
                iconLeftType="FontAwesome"
                iconLeft="quote-left"
              />
            </View>

            <TextInput
              placeholder="Fun fact (10 to 100 characters)"
              value={bio}
              width="100%"
              height="10%"
              onChangeText={(val) => setBio(val)}
              iconLeftType="FontAwesome"
              iconLeft="exclamation"
            />

            <NormalText marginTop={20}>Note: your age will not be publicly shown to others.</NormalText>

            <View style={styles.buttons}>
              <Button
                onPress={() => props.navigation.goBack()}
                marginHorizontal={10}
              >
                Back
              </Button>
              <Button
                disabled={
                  firstName === "" ||
                  lastName === "" ||
                  pronouns === "" ||
                  age === ""
                }
                onPress={goNext}
                marginHorizontal={10}
              >
                Next
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    width: "100%",
    backgroundColor: "#5DB075"
  },

  imageContainer: {
    marginTop: 30,
    alignItems: "center"
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 125
  },

  editImage: {
    left: 50,
    bottom: 50,
    padding: 15,
    backgroundColor: "#5DB075",
    borderRadius: 100
  },

  content: {
    paddingHorizontal: 20,
    alignItems: "center",
  },

  row: {
    width:"100%",
    height: "10%",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  tagInput: {
    width: "100%",
    marginVertical: 10
  },

  input: {
    width: Dimensions.get('screen').width/1.5,
    marginRight: 10
  },

  buttons: {
    marginTop: "30%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  }
});

export default Name;