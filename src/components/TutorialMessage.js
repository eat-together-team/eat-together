import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, Pressable, View } from 'react-native';

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
          onPress: () => setModalVisible(false),
          // and change this person's database status to "not first time logged in"
        },
      ],
    );
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { marginTop: props.top, marginLeft: props.left }]}>
            <View style={styles.modalContent}>
              <Text style={styles.titleText}>{props.title}</Text>
              <Text style={styles.tutorialText}>{props.content}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Image
                style={styles.image}
                source={require('eat-together/assets/tutorial.png')}
              />
              <Pressable
                style={[styles.buttonSkip]}
                onPress={handleSkipTutorial}
              >
                <Text style={styles.skipText}>skip tutorial</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonNext]}
                onPress={props.next}
              >
                <Text style={styles.nextText}>{props.nextText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start', // Align items to the left
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    marginBottom: 15,
    marginLeft: -15,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    marginBottom:-15,
    marginLeft: -25,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonSkip: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginLeft: 10,
  },
  buttonNext: {
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#306A41',
    paddingLeft: 20,
    paddingRight: 20,
    elevation: 30, // modified
    shadowColor: "black",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.57,
    shadowRadius: 4.65,
    marginLeft: 10,
  },
  nextText: {
    paddingTop: 40,
    color: '#306A41',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tutorialText: {
    textAlign: 'left', // Align text to the left
  },
  titleText: {
    marginTop: -20,
    marginBottom: 10,
    color: '#306A41',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
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
