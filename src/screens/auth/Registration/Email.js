// Email + school info

import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions, Image } from "react-native";
import { Layout } from "react-native-rapi-ui";
import * as Progress from 'react-native-progress';

import SuggestSelection from "../../../components/SuggestSelection";
import TextInput from "../../../components/TextInput";
import MediumText from "../../../components/MediumText";
import Button from "../../../components/Button";
import NormalText from "../../../components/NormalText";

import schools from "../../../schools";
import { cloneDeep } from "lodash";
import KeyboardAvoidingWrapper from "../../../components/KeyboardAvoidingWrapper";

const Email = props => {
  const [email, setEmail] = useState(props.email);
  const [verified, setVerified] = useState(true);
  const [school, setSchool] = useState(props.school);
  const [schoolSelected, setSchoolSelected] = useState(school ? [school] : []);

  const checkEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email); 
  }
  // const checkEmail = email => {
  //   const isAcademic = email.split("@");
  //   return isAcademic[isAcademic.length-1] === "uw.edu" || isAcademic[isAcademic.length-1] === "cs.washington.edu";
  // }

  const verifyEmail = () => {
    const isAcademic = email.split("@");
    if (isAcademic[isAcademic.length-1] === "uw.edu" || isAcademic[isAcademic.length-1] === "cs.washington.edu") {
      setVerified(true);
    } else {
      setVerified(false);
    }
  }

  useEffect(() => {
    setSchool(schoolSelected.join(""));
  }, [schoolSelected]);

  return (
    <Layout style={styles.page}>
      <KeyboardAvoidingWrapper>
        <View>
          <Image style={{ alignSelf: "center" }} source={require("../../../../assets/backpack.png")}/>
          <View style={{marginVertical: 20}}>
            <MediumText center>School Information</MediumText>
          </View>

          <NormalText color="red" style={{ opacity: checkEmail(email) ? 0 : 1 }}>
            Please enter a valid UW email
          </NormalText>
          <TextInput placeholder="UW School email address ..." value={email}
            onChangeText={newEmail => {
              setEmail(newEmail);
            }} 
            width="100%"
            autoComplete="email" 
            keyboardType="email-address"
            iconLeft="mail"
            required
          />

          <View style={styles.school}>
            <SuggestSelection
              multi={true}
              selectedItems={schoolSelected}
              onItemSelect={(item) => {
                setSchoolSelected(item.length !== 0 ? [item] : []);
              }}
              onRemoveItem={() => {
                setSchoolSelected([]);
              }}
              itemStyle={{
                padding: 10,
                borderWidth: 2,
                borderColor: '#5DB075',
                borderRadius: 10,
                marginTop: 2,
                width: "100%",
                height: 40,
                backgroundColor: "white"
              }}
              selectedItemsStyle={{
                margin: 0,
                height: 40,
                width: "100%",
                justifyContent: "space-around",
                backgroundColor: "white",
                borderColor: "lightgrey",
                borderWidth: 1,
                borderRadius: 10
              }}
              height={40}
              textInputProps={{
                placeholder: "School"
              }}
              onSubmitEditing = {(e) => {
                  if (e.nativeEvent.text.length !== 0) {
                    const newSelectedItems = [e.nativeEvent.text];
                    setSchoolSelected(newSelectedItems);
                  }}
              }
              containerStyle = {{
                height: 200,
              }}
              selectedItemsWidth={"100%"}
              items={cloneDeep(schools)}
              chip={true}
              resetValue={false}
              required
            />
          </View>

          {/* <Button disabled={!checkEmail(email) || school === ""} onPress={verifyEmail} marginVertical={15}>Verify</Button>
            {verified !== null &&
            <NormalText center color={verified ? "#5DB075" : "red"}>
              {verified ? "Is a UW student!" : "Not a UW student"}
          </NormalText>} */}

          <View style={styles.buttons}>
            <Button onPress={() => props.navigation.goBack()}
              marginHorizontal={10} backgroundColor="white"
              color="#5DB075">Back</Button>
            <Button disabled={!checkEmail(email) || school === ""}
              onPress={() => {
                props.setEmail(email);
                props.setSchool(school);
                props.navigation.navigate("Password");
              }}
              marginHorizontal={10}>Next</Button>
          </View>

          <Progress.Bar
            progress={0.8}
            width={200}
            color="#5DB075"
            style={{marginTop: 30, alignSelf: "center"}}
          />
          <NormalText center>Step 4 of 5</NormalText>
        </View>
      </KeyboardAvoidingWrapper>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingVertical: 50
  },

  school: {
    width: "100%",
    height: "7%",
    marginTop: 10,
    zIndex: 10
  },

  buttons: {
    marginTop: 150,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
});

export default Email;