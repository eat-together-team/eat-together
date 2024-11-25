// First page of registration

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Image, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView, Platform, Alert } from "react-native";
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

import * as ImagePicker from 'expo-image-picker';

import TextInput from "../../../components/TextInput";
import LargeText from "../../../components/LargeText";
import Button from "../../../components/Button";
import SuggestSelection from "../../../components/SuggestSelection";
import KeyboardAvoidingWrapper from "../../../components/KeyboardAvoidingWrapper";
import NormalText from "../../../components/NormalText";

import { checkProfanity } from "../../../methods";
import pronounTags from "../../../pronounTags";

import { cloneDeep } from "lodash";

const Name = props => {
  // Input fields
  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);
  const [age, setAge] = useState(props.age);
  const [pronouns, setPronouns] = useState(props.pronouns);
  const [pronounTagsSelected, setPronounTagsSelected] = useState(pronouns ? [pronouns] : []);
  const [bio, setBio] = useState(props.bio);
  const [image, setImage] = useState(props.image);

  // Height of parent view for SuggestSelection TextInput
  const [rowHeight, setRowHeight] = useState();
  // Height of banner for KeyboardAvoidingView
  const [bannerHeight, setBannerHeight] = useState();

  const goNext = () => {
    if (checkProfanity(firstName) || checkProfanity(lastName)) {
      alert("Name has inappropriate words >:(");
    } else if (checkProfanity(pronouns)) {
      alert("Pronouns have inappropriate words >:(");
    } else if (checkProfanity(bio)) {
      alert("Fun fact has inappropriate words >:(");
    } else if (new Date().getFullYear() - age < 18) {
      alert("You must be 18 years or older to use this app.");
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

  // For selecting a photo
  const handleChoosePhoto = async () => {
      Alert.alert (
          "Pick Image",
          "Choose an image",
          [
              {
                  text: "Gallery",
                  onPress: () => pickImage(),
              },
              { text: "Take a photo", onPress: () => cameraImageSelector() },
          ],
          { cancelable: false}
      );
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
              setImage(result.assets[0].uri);
          }
      } catch (error) {
          alert("Error uploading message: " + error.message);
      }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  }

  useEffect(() => {
    setPronouns(pronounTagsSelected.join(""));
  }, [pronounTagsSelected]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View onLayout={(e) => {setBannerHeight(e.nativeEvent.layout.height)}} style={styles.header}>
        <LargeText color="white" center size={25}>
          Let's set up your profile!
        </LargeText>
      </View>
      <ScrollView
        scrollEnabled={true}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        contentContainerStyle={{flexGrow: 1}}
      >
        <KeyboardAvoidingWrapper
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -bannerHeight-50}
        >
          <View>
            <View style={styles.imageContainer}>
              {image !== "" ? (
                <Image style={styles.image} source={{ uri: image }} />
              ) : (
                <ImageBackground
                  style={styles.image}
                  imageStyle={{ borderRadius: 125 }}
                  source={require("../../../../assets/logo.png")}
                >
                  <View style={styles.overImage}>
                    <NormalText center color="white">Image of yourself</NormalText>
                  </View>
                </ImageBackground>
              )}
              <TouchableOpacity style={styles.editImage} onPress={() => handleChoosePhoto()}>
                <Feather name="edit-2" size={24} color="black" />
              </TouchableOpacity>

            </View>

            <View style={styles.content}>
              <NormalText color="red">* = required</NormalText>
              <View style={styles.row} onLayout={(e) => {setRowHeight(e.nativeEvent.layout.height)}}>
                <TextInput
                  placeholder="First name"
                  value={firstName}
                  width = "47%"
                  height = "100%"
                  onChangeText={(val) => setFirstName(val)}
                  iconLeft = "person"
                  autoComplete="name"
                  required
                />
                <TextInput
                  placeholder="Last name"
                  value={lastName}
                  width = "47%"
                  height = "100%"
                  onChangeText={(val) => setLastName(val)}
                  iconLeft = "person"
                  autoComplete="name"
                  required
                />
              </View>

              <View style={{...styles.row, zIndex: 1}}>
                <TextInput
                  placeholder="Birth year"
                  value={age}
                  width="47%"
                  height="100%"
                  onChangeText={(val) => setAge(val)}
                  iconLeftType="Ionicons"
                  iconLeft="pencil-outline"
                  keyboardType="numeric"
                  required
                />

                <View style={{width: "47%"}}>
                  <SuggestSelection
                    multi={true}
                    selectedItems={pronounTagsSelected}
                    onItemSelect={(item) => {
                      setPronounTagsSelected(item.length !== 0 ? [item] : []);
                    }}
                    onRemoveItem={() => {
                      setPronounTagsSelected([]);
                    }}
                    itemStyle={{
                      padding: 10,
                      borderWidth: 2,
                      borderColor: '#5DB075',
                      borderRadius: 10,
                      marginTop: 2,
                      width: "100%",
                      height: rowHeight,
                      backgroundColor: "white"
                    }}
                    selectedItemsStyle={{
                      margin: 0,
                      height: rowHeight,
                      width: "100%",
                      justifyContent: "space-around",
                      backgroundColor: "white",
                      borderColor: "lightgrey",
                      borderWidth: 1,
                      borderRadius: 10
                    }}
                    height={rowHeight}
                    textInputProps={{
                      placeholder: "Pronouns"
                    }}
                    onSubmitEditing = {(e) => {
                        if (e.nativeEvent.text.length !== 0) {
                          const newSelectedItems = [e.nativeEvent.text];
                          setPronounTagsSelected(newSelectedItems);
                        }}
                    }
                    containerStyle = {{
                      height: 200,
                    }}
                    selectedItemsWidth={"47%"}
                    items={cloneDeep(pronounTags)}
                    chip={true}
                    resetValue={false}
                    required
                  />
                </View>
              </View>

              <TextInput
                placeholder="Fun fact"
                value={bio}
                width="100%"
                height="10%"
                onChangeText={(val) => setBio(val)}
                iconLeftType="FontAwesome"
                iconLeft="exclamation"
                required
              />

              <NormalText marginTop={10}>Note: your birth year will not be publicly shown to others.</NormalText>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "10%",
                  marginBottom: 10
                }}
              >
                <NormalText>Already have an account? </NormalText>
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate("Login");
                  }}
                >
                  <NormalText color="#5DB075">Login</NormalText>
                </TouchableOpacity>
              </View>

              <View style={styles.buttons}>
                <Button
                  onPress={() => props.navigation.goBack()}
                  marginHorizontal={10}
                  backgroundColor="white"
                  color="#5DB075"
                  zIndex={-1}
                >
                  Exit
                </Button>
                <Button
                  disabled={
                    firstName === "" ||
                    lastName === "" ||
                    pronouns === "" ||
                    age === "" ||
                    bio === ""
                  }
                  onPress={goNext}
                  marginHorizontal={10}
                  zIndex={-1}
                >
                  Next
                </Button>
              </View>

              <Progress.Bar progress={0.2} width={200} color="#5DB075" style={{marginTop: 30}}/>
              <NormalText>Step 1 of 5</NormalText>
            </View>
          </View>
        </KeyboardAvoidingWrapper>
      </ScrollView>
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
    borderRadius: 125,
    alignItems: "center",
    justifyContent: "center"
  },

  overImage: {
    width: "90%",
    backgroundColor: "#AAAAAA",
    borderRadius: 5
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
    width: "100%",
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  }
});

export default Name;
