import React, { useState } from "react";
import { View } from "react-native";
import styles from "./styles/DayStyles";
import { Layout } from "react-native-rapi-ui";
import { cloneDeep } from "lodash";

import Button from "../../../components/Button";
import Times from "../../../components/Times";
import LargeText from "../../../components/LargeText";

const Day = props => {
    const oldTimes = cloneDeep(props.route.params.times);
    const [times, setTimes] = useState(props.route.params.times);

    const clickTime = index => {
      const newTimes = cloneDeep(times);
      newTimes[index].available = !newTimes[index].available;
      setTimes(newTimes);
    }

    return (
        <Layout style={styles.page}>
            <LargeText center>When would you like to eat on {props.route.params.day}?</LargeText>

            <Times times={times} change={clickTime}/>

            <View style={styles.buttons}>
                <Button onPress={() => {
                  props.route.params.setTimes(oldTimes);
                  props.navigation.goBack();
                }}
                  marginHorizontal={10}>
                  Cancel
                </Button>
                <Button onPress={() => {
                  props.route.params.setTimes(times);
                  props.navigation.goBack();
                }} marginHorizontal={10}>
                  Save!
                </Button>
            </View>
        </Layout>
    );
}

  

export default Day;