import React, { useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, Text } from 'react-native';

import NormalText from './NormalText';
import MediumText from './MediumText';
import Link from './Link';
import BorderedButton from './BorderedButton';

import { db } from "../provider/Firebase";

const RecTutorialMessage = (props) => {
  const { navigation } = props;
  const [modalVisible, setModalVisible] = useState(true);

  const handleSkipTutorial = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to end the tutorial?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setModalVisible(false);

            db.collection("Users").doc(props.userId).update({
              "settings.attendingTutorial": false
            }).then(() => {
              console.log("Document successfully updated!");
            }).catch((error) => {
              console.error("Error updating document: ", error);
            });
          },
        },
      ],
    );
  };

  // Go to Home screen
  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  if (!modalVisible) return null;

  return (
    <View style={[styles.modalView, {"bottom": props.bottom ? props.bottom : "10%"}]} pointerEvents="box-none">
      <View style={styles.modalContent}>
        <View style={styles.spacedRow}>
          <MediumText style={styles.titleText}>{props.title}</MediumText>
          {(!props.completedTutorial) && ( // Only show skip tutorial link if user has completed tutorial
            <Link onPress={handleSkipTutorial}>Skip Tutorial</Link>
          )}
        </View>
        
        <NormalText style={styles.tutorialText}>{props.content}</NormalText>
      </View>
      <View style={styles.buttonContainer}>
        {props.enableBack && (
          <BorderedButton
            marginHorizontal={10}
            paddingVertical={10}
            paddingHorizontal={20}
            fontSize={14}
            onPress={props.onBack}
          >
            Back
          </BorderedButton>
        )}
        {props.enableNext && (
          <BorderedButton
            marginHorizontal={10}
            paddingVertical={10}
            paddingHorizontal={20}
            fontSize={14}
            onPress={props.onNext}
          >
            Next
          </BorderedButton>
        )}
        {props.goHome && (
        <BorderedButton
          marginHorizontal={10}
          paddingVertical={10}
          paddingHorizontal={20}
          fontSize={14}
          onPress={handleGoHome}
        >
          Next
        </BorderedButton>
      )}
        {props.completedTutorial && (
          <BorderedButton
            marginHorizontal={10}
            paddingVertical={10}
            paddingHorizontal={20}
            fontSize={14}
            onPress={handleSkipTutorial}
          >
            Done
          </BorderedButton>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    modalView: {
      position: 'absolute',
      bottom: "10%",
      left: 10,
      right: 10,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      zIndex: 100,
      borderWidth: 2,  // Add this line to specify border width
      borderColor: '#5DB075',  // Add this line to specify border color
    },  
  
    spacedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
  
    modalContent: {
      marginBottom: 15
    },
  
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
  
    image: {
      width: 80,
      height: 80,
    },
  
    skipText: {
      color: '#767676',
      paddingTop: 50,
      textDecorationLine: 'underline',
    }
  });

export default RecTutorialMessage;
