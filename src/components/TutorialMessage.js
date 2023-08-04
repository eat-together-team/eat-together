import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, View } from 'react-native';

import NormalText from './NormalText';
import MediumText from './MediumText';
import Link from './Link';
import Button from './Button';
import BorderedButton from './BorderedButton';

const TutorialMessage = (props) => {
  const [modalVisible, setModalVisible] = useState(true);

  const handleSkipTutorial = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to skip the tutorial?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setModalVisible(false);
            // TODO: change this person's database status so that they don't see the tutorial again (using Firestore)
          },
          
        },
      ],
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
    >
      <View style={[styles.modalView, {"bottom": props.bottom ? props.bottom : "10%"}]}>
        <View style={styles.modalContent}>
          <View style={styles.spacedRow}>
            <MediumText style={styles.titleText}>{props.title}</MediumText>
            <Link onPress={handleSkipTutorial}>Skip Tutorial</Link>
          </View>
          
          <NormalText style={styles.tutorialText}>{props.content}</NormalText>
        </View>
        <View style={styles.buttonContainer}>
          <Image
            style={styles.image}
            source={require('eat-together/assets/logo.png')}
          />
          <BorderedButton
            marginHorizontal={10}
            paddingVertical={10}
            paddingHorizontal={20}
            fontSize={14}
            onPress={props.prev}
          >
            Back
          </BorderedButton>
          <Button
            paddingVertical={10}
            paddingHorizontal={20}
            fontSize={14}
            onPress={props.next}
          >
            Next
          </Button>
        </View>
      </View>
    </Modal>
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

export default TutorialMessage;
