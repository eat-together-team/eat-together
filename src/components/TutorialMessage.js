import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, View } from 'react-native';

import NormalText from './NormalText';
import MediumText from './MediumText';
import Link from './Link';
import Button from './Button';
import BorderedButton from './BorderedButton';

import { db } from "../provider/Firebase";

import arrow from "../../assets/tutorial-arrow.png"
import skip from "../../assets/tutorial-skip.png"


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
          {/* Arrow */}
            <Image
              source={arrow} 
              style={{
                width: 50,
                position: 'absolute', 
                left: props.left,
                bottom: props.bottom ? parseInt(props.bottom) + actualModalHeight : 10,
                height: 25,
                resizeMode: 'contain',
                zIndex: 999,
              }}
            />
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
            <Link onPress={handleSkipTutorial}><Image
              source={skip} 
              style={{
                width: 50,
                position: 'absolute', 
                height: 25,
                resizeMode: 'contain',
                zIndex: 900,
              }}
            /></Link>
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
                Finish Tutorial
              </Button>
            ) : (
              <Button
                paddingVertical={10}
                paddingHorizontal={20}
                fontSize={14}
                onPress={props.next}
              >
                Next -&gt;
              </Button>
            )}
          </View>
        </View>
        {props.status && (
          <View style={styles.spacedRow}>
            <View style={styles.statusOverall}>
              <View style={{
                backgroundColor: '#5DB075',
                borderRadius: 20,
                height: 10,
                width: `${props.status}%`, 
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 2,
              }}/>
            </View>
          </View>
        )}
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
    borderColor: '#FFFFFF',  // Add this line to specify border color
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
    justifyContent: 'flex-end',
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
  },

  titleText: {
    color: '#2f6a40',
  },

  statusOverall: {
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    height: 10,
    width: '100%',
    position: 'relative', 
    zIndex: 1,
    marginTop: 20
  },

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
