// Specify availabilities for days of the week

import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Layout } from "react-native-rapi-ui";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";

import Button from "../../../components/Button";
import Availability from "../../../components/Availability";

import getTime from "../../../utils/getTime";
import moment from "moment";
import { db } from "../../../provider/Firebase";

const AvailabilitiesStatic = props => {
  // Convert Firebase timestamps in timeslots to moment objects
  const convert = day => {
    return day.map(d => ({
      startTime: !(d.startTime instanceof Date) ? d.startTime.toDate() : d.startTime,
      endTime: !(d.endTime instanceof Date) ? d.endTime.toDate() : d.endTime
    }));
  }

  // Preferred times for days of the week
  const [monday, setMonday] = useState(convert(props.route.params.user.availabilities.monday));
  const [tuesday, setTuesday] = useState(convert(props.route.params.user.availabilities.tuesday));
  const [wednesday, setWednesday] = useState(convert(props.route.params.user.availabilities.wednesday));
  const [thursday, setThursday] = useState(convert(props.route.params.user.availabilities.thursday));
  const [friday, setFriday] = useState(convert(props.route.params.user.availabilities.friday));
  const [saturday, setSaturday] = useState(convert(props.route.params.user.availabilities.saturday));
  const [sunday, setSunday] = useState(convert(props.route.params.user.availabilities.sunday));

  useEffect(() => {
    if (props.route.params && props.route.params.freeTimes) {
      setMonday([]); setTuesday([]); setWednesday([]); setThursday([]); setFriday([]); setSaturday([]); setSunday([]);
      props.route.params.freeTimes.forEach(time => {
        const startTime = new Date(time.start);
        const endTime = new Date(time.end);
        switch (time.dayOfWeek) {
          case 1:
            setMonday(prev => [...prev, { startTime, endTime }]);
            break;
          case 2:
            setTuesday(prev => [...prev, { startTime, endTime }]);
            break;
          case 3:
            setWednesday(prev => [...prev, { startTime, endTime }]);
            break;
          case 4:
            setThursday(prev => [...prev, { startTime, endTime }]);
            break;
          case 5:
            setFriday(prev => [...prev, { startTime, endTime }]);
            break;
          case 6:
            setSaturday(prev => [...prev, { startTime, endTime }]);
            break;
          case 0:
            setSunday(prev => [...prev, { startTime, endTime }]);
            break;
        }
      });
    }
  }, []);

  return (
    <Layout style={styles.page}>
      <LargeText center size={28}>
        {props.route.params.user.firstName}'s preferred eating times!
      </LargeText>

      <ScrollView contentContainerStyle={styles.dates}>
        <View style={styles.day}>
          <MediumText>Monday</MediumText>
          {monday.length === 0 && <NormalText>None</NormalText>}

          {monday.length !== 0 && <View style={styles.timeSlots}>
            {monday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>

        <View style={styles.day}>
          <MediumText>Tuesday</MediumText>
          {tuesday.length === 0 && <NormalText>None</NormalText>}

          {tuesday.length !== 0 && <View style={styles.timeSlots}>
            {tuesday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>
          
        <View style={styles.day}>
          <MediumText>Wednesday</MediumText>
          {wednesday.length === 0 && <NormalText>None</NormalText>}

          {wednesday.length !== 0 && <View style={styles.timeSlots}>
            {wednesday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>

        <View style={styles.day}>
          <MediumText>Thursday</MediumText>
          {thursday.length === 0 && <NormalText>None</NormalText>}

          {thursday.length !== 0 && <View style={styles.timeSlots}>
            {thursday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>

        <View style={styles.day}>
          <MediumText>Friday</MediumText>
          {friday.length === 0 && <NormalText>None</NormalText>}

          {friday.length !== 0 && <View style={styles.timeSlots}>
            {friday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>

        <View style={styles.day}>
          <MediumText>Saturday</MediumText>
          {saturday.length === 0 && <NormalText>None</NormalText>}

          {saturday.length !== 0 && <View style={styles.timeSlots}>
            {saturday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>

        <View style={styles.day}>
          <MediumText>Sunday</MediumText>
          {sunday.length === 0 && <NormalText>None</NormalText>}

          {sunday.length !== 0 && <View style={styles.timeSlots}>
            {sunday.map((time, index) => <Availability
              time={time}
              index={index}
              key={index}
            />)}
          </View>}
        </View>
      </ScrollView>
      
      <Button onPress={() => props.navigation.goBack()} marginVertical={10}
        marginHorizontal={10} backgroundColor="white"
        color="#5DB075">Back</Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40
  },

  dates: {
    marginTop: 20
  },

  day: {
    marginBottom: 20
  },

  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  row: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export default AvailabilitiesStatic;