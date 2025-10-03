// Allows the user to select a color for their profile banner.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ColorPicker, { Panel1, Swatches, colorKit, PreviewText, HueCircular } from 'reanimated-color-picker';

import Button from '../../components/Button';
import { db, auth } from "../../provider/Firebase";

export default function ColorSelector({ navigation, route }) {
  const user = auth.currentUser; // Get the current user
  const [loading, setLoading] = useState(false); // Loading state

  // For color picking
  const customSwatches = new Array(6).fill('#fff').map(() => colorKit.randomRgbColor().hex());
  const selectedColor = useSharedValue(route.params.oldbanner);
  const backgroundColorStyle = useAnimatedStyle(() => ({ backgroundColor: selectedColor.value }));

  // Function to handle color selection and update the database
  const onColorSelect = (color) => {
    'worklet';
    selectedColor.value = color.hex;

    // db.collection("Users").doc(user.uid).update({
    //   "settings.banner": selectedColor.value,
    // });
  };

  return (
    <>
      <Animated.View style={[styles.container, backgroundColorStyle]}>
        <View style={styles.pickerContainer}>
          <ColorPicker value={selectedColor.value} sliderThickness={20} thumbSize={24} onChange={onColorSelect} boundedThumb>
            <HueCircular containerStyle={styles.hueContainer} thumbShape='pill'>
              <Panel1 style={styles.panelStyle} />
            </HueCircular>
            <Swatches style={styles.swatchesContainer} swatchStyle={styles.swatchStyle} colors={customSwatches} />
            <View style={styles.previewTxtContainer}>
              <PreviewText style={{ color: '#707070' }} colorFormat='hsl' />
            </View>
          </ColorPicker>
        </View>
        
        <View style={styles.row}>
          <Button
            backgroundColor="#fff"
            color="#5DB075" 
            style={styles.openButton}
            onPress={() => navigation.goBack()}
          >
            Back
          </Button>
          <Button disabled={loading} onPress={() => {
            setLoading(true);

            db.collection("Users").doc(user.uid).update({
              "settings.banner": selectedColor.value,
            }).then(() => {
              navigation.navigate("Me");
              alert("Color saved!");
            });
          }}>
            {loading ? "Loading" : "Save"}
          </Button>
        </View>
      </Animated.View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
  },
  pickerContainer: {
    alignSelf: 'center',
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  hueContainer: {
    justifyContent: 'center',
  },
  panelStyle: {
    width: '70%',
    height: '70%',
    alignSelf: 'center',
    borderRadius: 16,
  },
  previewTxtContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#bebdbe',
  },
  swatchesContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#bebdbe',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 10,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 20
  },
});
