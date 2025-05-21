import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, View, Dimensions } from 'react-native';

import NormalText from './NormalText';
import MediumText from './MediumText';
import Link from './Link';
import Button from './Button';
import BorderedButton from './BorderedButton';

import { db } from "../provider/Firebase";

const screenWidth = Dimensions.get('window').width;

const TutorialMessage = (props) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [arrowVisible, setArrowVisible] = useState(true);
  const estimatedModalHeight = 200;
  const actualModalHeight = props.modalHeight ? props.modalHeight : estimatedModalHeight;

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
            setArrowVisible(false);

            db.collection("Users").doc(props.userId).update({
              "settings.tabsTutorial": false
            }).then(() => {
              console.log("Document successfully updated!");
              if (props.callback) {
                props.callback();
              }
            }).catch((error) => {
              console.error("Error updating document: ", error);
            });
          },
          
        },
      ],
    );
  };

  return (
    <>
      {modalVisible && <Backdrop />}
      {arrowVisible && (
        <>
          {/* Line with Arrow */}
          <View
            style={{
              position: 'absolute',
              left: props.left,
              bottom: props.bottom ? parseInt(props.bottom) + actualModalHeight : 10,
              height: props.length ? props.length : 50,
              width: 0,
              zIndex: 999,
              borderLeftWidth: 25,
              borderRightWidth: 25,
              borderBottomWidth: 50,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'white',
              transform: [{ rotate: '180deg' }],
            }}
          >
            <View 
              style={{
                position: 'absolute',
                top: -20,
                left: -7,
                width: 0,
                height: 0,
                zIndex: 999,
                borderColor: 'transparent',
                borderTopColor: 'white',
                borderWidth: 10,
                transform: [{ rotate: '180deg' }],
              }}
            />
          </View>
      </>
    )}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      style={{ pointerEvents: 'none' }}
    >
      <View style={[styles.modalView, {"bottom": props.bottom ? props.bottom : "10%"}]} pointerEvents="box-none">
        <View style={styles.modalContent}>
          <View style={styles.spacedRow}>
            <MediumText style={styles.titleText}>{props.title}</MediumText>
            <Link onPress={handleSkipTutorial}>Skip Tutorial</Link>
          </View>
          
          <NormalText style={styles.tutorialText}>{props.content}</NormalText>
        </View>
        <View style={styles.buttonContainer}>
          {!props.disableBack && (
            <BorderedButton
              marginHorizontal={10}
              paddingVertical={10}
              paddingHorizontal={20}
              fontSize={14}
              onPress={props.back}
            >
              Back
            </BorderedButton>
          )}
          <View style={props.disableBack ? { marginLeft: 10 } : {}}>
            {props.disableNext ? (
              <Button
                paddingVertical={10}
                paddingHorizontal={20}
                fontSize={14}
                onPress={handleSkipTutorial}
              >
                Done
              </Button>
            ) : (
              <Button
                paddingVertical={10}
                paddingHorizontal={20}
                fontSize={14}
                onPress={props.next}
              >
                Next
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal> 
    
    </>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,  // Add this line to specify border width
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

const Backdrop = () => {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10,
    }} />
  );
};

export default TutorialMessage;
