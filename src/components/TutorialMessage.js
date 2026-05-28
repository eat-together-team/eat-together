import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Text, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

import NormalText from './NormalText';
import MediumText from './MediumText';
import Link from './Link';
import Button from './Button';
import BorderedButton from './BorderedButton';
import { Ionicons } from "@expo/vector-icons";

import { db } from "../provider/Firebase";

const { height, width } = Dimensions.get('screen');

const Backdrop = ({ cutout }) => {
  if (!cutout) {
    return (
      <BlurView
        intensity={35}
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height,
          zIndex: 0,
        }}
      />
    );
  }

  const pad = cutout.padding ?? 10;
  const radius = cutout.borderRadius ?? 10;
  const cutX = cutout.x - pad;
  const cutY = cutout.y - pad;
  const cutW = cutout.width + pad * 2;
  const cutH = cutout.height + pad * 2;

  const blurProps = { intensity: 35, tint: "dark", pointerEvents: "auto" };
  const base = { position: 'absolute', zIndex: 0 };

  return (
    <>
      <BlurView {...blurProps} style={[base, { top: 0, left: 0, width, height: cutY }]} />
      <BlurView {...blurProps} style={[base, { top: cutY + cutH, left: 0, width, height: height - (cutY + cutH) }]} />
      <BlurView {...blurProps} style={[base, { top: cutY, left: 0, width: cutX, height: cutH }]} />
      <BlurView {...blurProps} style={[base, { top: cutY, left: cutX + cutW, width: width - (cutX + cutW), height: cutH }]} />
      {cutout.onPress ? (
        <TouchableOpacity
          onPress={cutout.onPress}
          style={{
            position: 'absolute',
            zIndex: 2,
            top: cutY,
            left: cutX,
            width: cutW,
            height: cutH,
            borderRadius: radius,
            overflow: 'hidden',
          }}
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            top: cutY,
            left: cutX,
            width: cutW,
            height: cutH,
            borderRadius: radius,
            overflow: 'hidden',
          }}
        />
      )}
    </>
  );
};

const TutorialMessage = (props) => {

  console.log('Component Props:', props);

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

  // The inner content of the tutorial message, shared between Modal and View modes
  const innerContent = (
    <>
      <Backdrop cutout={props.cutout} />

      {props.type !== "intro" && props.type !== "outro" && (
        <TouchableOpacity style={styles.closeButton} onPress={handleSkipTutorial}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      )}

      <View style={[
        styles.modalView,
        { bottom: props.bottom },
        props.type === "intro"
          ? styles.introModal
          : props.type === "outro"
          ? styles.outroModal
          : styles.tutorialModal
      ]}>
        <View>
          <>
            {props.type === "intro" && (
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
              />
            )}

            <MediumText
              size={20}
              style={[
                props.type === "intro" || props.type === "outro"
                  ? styles.outroTitle
                  : styles.titleText,
              ]}
            >
              {props.title}
            </MediumText>
          </>

          <NormalText
            size={16}
            style={
              props.type === "intro" ? styles.introText
              : props.type === "outro" ? styles.outroText
              : styles.tutorialText
            }
          >
            {props.content}
          </NormalText>

          {props.subContent && (
            <NormalText size={12} style={styles.subText}>
              {props.subContent}
            </NormalText>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {props.type === "intro" && (
            <View style={styles.introButtonRow}>
              <View style={styles.introButtonWrapper}>
                <BorderedButton
                  onPress={handleSkipTutorial}
                  color="#CD6B6C"
                  borderWidth={1}
                  fontSize={13}
                  height={36}
                  paddingVertical={0}
                  paddingHorizontal={0}
                  width={111}
                  style={[styles.noThanksButton,
                    {
                      shadowColor: "#CD6B6C",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.27,
                      shadowRadius: 4.65,
                      elevation: 5,
                    }
                  ]}
                  textStyle={styles.noThanksText}
                >
                  No Thanks!
                </BorderedButton>
              </View>

              <View style={styles.introButtonWrapper}>
                <Button
                  onPress={props.next}
                  height={36}
                  fontSize={13}
                  style={styles.letsGoButton}
                  paddingHorizontal={0}
                  paddingVertical={0}
                  width={111}
                >
                  Let's Go
                </Button>
              </View>
            </View>
          )}
          {props.type !== "intro" && (
            <View style={styles.arrowRow}>
              {!props.disableBack && (
                <TouchableOpacity style={styles.backArrowContainer} onPress={props.back}>
                  <Ionicons
                    name="arrow-back-outline"
                    size={17}
                    color="#00000040"
                    onPress={props.back}
                  />
                </TouchableOpacity>
              )}

              {props.type !== "intro" && !props.disableNext && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${props.progress}%` }
                    ]}
                  />
                </View>
              )}

              {!props.disableNext && (
                <TouchableOpacity style={styles.nextArrowContainer} onPress={props.next}>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={17}
                    color="white"
                    onPress={props.next}
                  />
                </TouchableOpacity>
              )}

              {props.disableNext && (
                <Button
                  paddingVertical={10}
                  paddingHorizontal={20}
                  fontSize={14}
                  onPress={handleSkipTutorial}
                  width={props.type === "outro" ? 278 : 111}
                  height={props.type === "outro" ? 36 : undefined}
                >
                  Let's Go
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    </>
  );

  // If noModal prop is passed, render without a Modal wrapper (needed when
  // another modal like RBSheet needs to open on top — iOS won't allow modal on modal)
  if (props.noModal) {
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {modalVisible && innerContent}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      style={{ pointerEvents: 'none' }}
    >
      {innerContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  introModal: {
    width: 337,
    alignSelf: "center",
    left: "auto",
    right: "auto",
    paddingTop: 27,
    paddingBottom: 33,
    paddingHorizontal: 18,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  tutorialModal: {
    paddingTop: 21,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },

  outroModal: {
    paddingTop: 30,
    paddingBottom: 34,
    paddingHorizontal: 18,
    width: 337,
    alignSelf: "center",
    left: "auto",
    right: "auto",
  },

  outroText: {
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 34,
    fontSize: 12,
    width: 250,
  },

  outroTitle: {
    textAlign: "center",
    width: "100%",
    marginBottom: 14,
  },

  logo: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 17,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  titleText: {
    marginBottom: 15,
  },

  tutorialText: {
    marginBottom: 58,
  },

  introText: {
    textAlign: "center",
    width: 271,
    alignSelf: "center",
    marginBottom: 27,
  },

  subText: {
    textAlign: "center",
    marginBottom: 26,
    maxWidth: 250,
    alignSelf: "center",
  },

  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },

  backArrowContainer: {
    width: 40,
    height: 31,
    borderWidth: 1,
    borderColor: "#00000040",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 10,
  },

  nextArrowContainer: {
    width: 40,
    height: 31,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5DB075",
    marginLeft: 10,
  },

  progressBar: {
    flex: 1,
    height: 19,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#5DB075",
    width: "0%",
  },

  image: {
    width: 80,
    height: 80,
  },

  introButtonWrapper: {
    alignItems: "center"
  },

  introButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },

  letsGoButton: {
    backgroundColor: "#5DB075",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  noThanksButton: {
    borderWidth: 1,
    borderColor: "#CD6B6C",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  closeButton: {
    position: "absolute",
    top: 40,
    left: 10,
    width: 40,
    height: 38,
    borderRadius: 4,
    backgroundColor: "#CD6B6C",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  noThanksText: {
    color: "#CD6B6C",
  },

  skipText: {
    color: '#767676',
    paddingTop: 50,
    textDecorationLine: 'underline',
  },

  tapHint: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
  },
  tapHintText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default TutorialMessage;
