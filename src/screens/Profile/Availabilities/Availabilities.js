// Specify availabilities for days of the week

import React, { useState, useRef, useEffect } from "react";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Layout } from "react-native-rapi-ui";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import RBSheet from "react-native-raw-bottom-sheet";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";

import Button from "../../../components/Button";
import BorderedButton from "../../../components/BorderedButton";
import SelectButton from "../../../components/SelectButton";
import Availability from "../../../components/Availability";
import TextInput from "../../../components/TextInput";

import getTime from "../../../getTime";
import moment from "moment";
import { db } from "../../../provider/Firebase";

const Availabilities = props => {
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

  // For the bottom drawer
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(moment(new Date()).add(1, 'hours').toDate());
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [daySelected, setDaySelected] = useState("Monday");

  // Used for editing a time slot
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [index, setIndex] = useState(0);

  const timeSheet = useRef(); // To toggle the add time drawer on/off
  const editSheet = useRef(); // To toggle the edit drawer on/off

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

  // For selecting a start time
  const changeStartTime = (time) => {
    const currentTime = time || startTime;
    setStartTime(currentTime); // Set the date
    setShowStartTime(false); // Exit the date/time picker modal
  }

  // For selecting an end time
  const changeEndTime = (time) => {
    const currentTime = time || endTime;
    setEndTime(currentTime); // Set the date
    setShowEndTime(false); // Exit the date/time picker modal
  }

  // Adds eating time to UI
  const addTime = () => {
    if (startTime >= endTime) {
      alert("End time must be after start time!");
    } else {
      timeSheet.current.close();

      switch (daySelected) {
        case "Monday":
          setMonday([...monday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Tuesday":
          setTuesday([...tuesday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Wednesday":
          setWednesday([...wednesday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Thursday":
          setThursday([...thursday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Friday":
          setFriday([...friday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Saturday":
          setSaturday([...saturday, { startTime: startTime, endTime: endTime }]);
          break;
        case "Sunday":
          setSunday([...sunday, { startTime: startTime, endTime: endTime }]);
          break;
      }
    }
  }

  // Delete a time slot
  const deleteTime = (index, day) => {
    editSheet.current.close();
    switch (day) {
      case "Monday":
        setMonday(monday.filter((time, i) => i !== index));
        break;
      case "Tuesday":
        setTuesday(tuesday.filter((time, i) => i !== index));
        break;
      case "Wednesday":
        setWednesday(wednesday.filter((time, i) => i !== index));
        break;
      case "Thursday":
        setThursday(thursday.filter((time, i) => i !== index));
        break;
      case "Friday":
        setFriday(friday.filter((time, i) => i !== index));
        break;
      case "Saturday":
        setSaturday(saturday.filter((time, i) => i !== index));
        break;
      case "Sunday":
        setSunday(sunday.filter((time, i) => i !== index));
        break;
    }
  }

  // Edit a time slot
  const editTime = (index, day) => {
    editSheet.current.open();
    setDayOfWeek(day);
    setIndex(index);
    switch (day) {
      case "Monday":
        setStartTime(monday[index].startTime);
        setEndTime(monday[index].endTime);
        break;
      case "Tuesday":
        setStartTime(tuesday[index].startTime);
        setEndTime(tuesday[index].endTime);
        break;
      case "Wednesday":
        setStartTime(wednesday[index].startTime);
        setEndTime(wednesday[index].endTime);
        break;
      case "Thursday":
        setStartTime(thursday[index].startTime);
        setEndTime(thursday[index].endTime);
        break;
      case "Friday":
        setStartTime(friday[index].startTime);
        setEndTime(friday[index].endTime);
        break;
      case "Saturday":
        setStartTime(saturday[index].startTime);
        setEndTime(saturday[index].endTime);
        break;
      case "Sunday":
        setStartTime(sunday[index].startTime);
        setEndTime(sunday[index].endTime);
        break;
    }
  }

  // Save the edited time slot
  const saveTime = () => {
    if (startTime >= endTime) {
      alert("End time must be after start time!");
    } else {
      editSheet.current.close();
      switch (dayOfWeek) {
        case "Monday":
          const mondayCopy = [...monday];
          mondayCopy[index] = { startTime, endTime };
          setMonday(mondayCopy);
          break;
        case "Tuesday":
          const tuesdayCopy = [...tuesday];
          tuesdayCopy[index] = { startTime, endTime };
          setTuesday(tuesdayCopy);
          break;
        case "Wednesday":
          const wednesdayCopy = [...wednesday];
          wednesdayCopy[index] = { startTime, endTime };
          setWednesday(wednesdayCopy);
          break;
        case "Thursday":
          const thursdayCopy = [...thursday];
          thursdayCopy[index] = { startTime, endTime };
          setThursday(thursdayCopy);
          break;
        case "Friday":
          const fridayCopy = [...friday];
          fridayCopy[index] = { startTime, endTime };
          setFriday(fridayCopy);
          break;
        case "Saturday":
          const saturdayCopy = [...saturday];
          saturdayCopy[index] = { startTime, endTime };
          setSaturday(saturdayCopy);
          break;
        case "Sunday":
          const sundayCopy = [...sunday];
          sundayCopy[index] = { startTime, endTime };
          setSunday(sundayCopy);
          break;
      }
    }
  }

  // Save the user's free times to the database
  const saveAvailabilities = async () => {
    const newAvailabilities = {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    };

    db.collection("Users").doc(props.route.params.user.id).update({
      availabilities: newAvailabilities
    });

    props.route.params.updateAvailabilities(newAvailabilities);
    props.navigation.navigate("Me");
    alert("Saved successfully!");
  }

  return (
    <Layout style={styles.page}>
        <LargeText center size={28}>Preferred eating times!</LargeText>
        <NormalText center>Click on the timeslots to edit or delete them.</NormalText>

        <ScrollView contentContainerStyle={styles.dates}>
          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Monday"); timeSheet.current.open()}}>
              <MediumText>Monday</MediumText>
              {monday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {monday.length !== 0 && <View style={styles.timeSlots}>
              {monday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Monday")}
              />)}
            </View>}
          </View>

          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Tuesday"); timeSheet.current.open()}}>
              <MediumText>Tuesday</MediumText>
              {tuesday.length === 0 && <NormalText>None</NormalText>} 
            </TouchableOpacity>

            {tuesday.length !== 0 && <View style={styles.timeSlots}>
              {tuesday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Tuesday")}
              />)}
            </View>}
          </View>
            
          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Wednesday"); timeSheet.current.open()}}>
              <MediumText>Wednesday</MediumText>
              {wednesday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {wednesday.length !== 0 && <View style={styles.timeSlots}>
              {wednesday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Wednesday")}
              />)}
            </View>}
          </View>

          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Thursday"); timeSheet.current.open()}}>
              <MediumText>Thursday</MediumText>
              {thursday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {thursday.length !== 0 && <View style={styles.timeSlots}>
              {thursday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Thursday")}
              />)}
            </View>}
          </View>

          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Friday"); timeSheet.current.open()}}>
              <MediumText>Friday</MediumText>
              {friday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {friday.length !== 0 && <View style={styles.timeSlots}>
              {friday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Friday")}
              />)}
            </View>}
          </View>

          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Saturday"); timeSheet.current.open()}}>
              <MediumText>Saturday</MediumText>
              {saturday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {saturday.length !== 0 && <View style={styles.timeSlots}>
              {saturday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Saturday")}
              />)}
            </View>}
          </View>

          <View style={styles.day}>
            <TouchableOpacity onPress={() => {setDaySelected("Sunday"); timeSheet.current.open()}}>
              <MediumText>Sunday</MediumText>
              {sunday.length === 0 && <NormalText>None</NormalText>}
            </TouchableOpacity>

            {sunday.length !== 0 && <View style={styles.timeSlots}>
              {sunday.map((time, index) => <Availability
                time={time}
                index={index}
                key={index}
                edit={() => editTime(index, "Sunday")}
              />)}
            </View>}
          </View>
        </ScrollView>

        <Button
          marginVertical={20}
          onPress={() => timeSheet.current.open()}>
            + Add preferred time
        </Button>

        <RBSheet
            height={400}
            ref={timeSheet}
            closeOnDragDown={true}
            closeOnPressMask={false}
            customStyles={{
                wrapper: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                },
                draggableIcon: {
                    backgroundColor: "#5DB075"
                },
                container: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 10
                }
            }}>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => setShowStartTime(true)} style={styles.smallInput}>
                    <NormalText center>Start time</NormalText>
                    <View pointerEvents="none">
                        <TextInput
                            value={getTime(startTime)}
                            iconLeft="time-outline"
                            width="100%"
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowEndTime(true)} style={styles.smallInput}>
                    <View pointerEvents="none">
                        <NormalText center>End time</NormalText>
                        <TextInput
                            value={getTime(endTime)}
                            iconLeft="time-outline"
                            width="100%"
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <SelectButton selected={daySelected === "Monday"} onPress={() => setDaySelected("Monday")}>M</SelectButton>
              <SelectButton selected={daySelected === "Tuesday"} onPress={() => setDaySelected("Tuesday")}>Tu</SelectButton>
              <SelectButton selected={daySelected === "Wednesday"} onPress={() => setDaySelected("Wednesday")}>W</SelectButton>
              <SelectButton selected={daySelected === "Thursday"} onPress={() => setDaySelected("Thursday")}>Th</SelectButton>
              <SelectButton selected={daySelected === "Friday"} onPress={() => setDaySelected("Friday")}>F</SelectButton>
              <SelectButton selected={daySelected === "Saturday"} onPress={() => setDaySelected("Saturday")}>Sa</SelectButton>
              <SelectButton selected={daySelected === "Sunday"} onPress={() => setDaySelected("Sunday")}>Su</SelectButton>
            </View>

            <Button marginVertical={20} onPress={addTime}>Add time</Button>

            <View>
              <DateTimePickerModal isVisible={showStartTime} date={startTime} style={{width:'100%'}}
                  mode="time" onConfirm={changeStartTime} onCancel={() => setShowStartTime(false)}/>
              <DateTimePickerModal isVisible={showEndTime} date={endTime} style={{width:'100%'}}
                  mode="time" onConfirm={changeEndTime} onCancel={() => setShowEndTime(false)}/>
            </View>
        </RBSheet>

        <RBSheet
            height={400}
            ref={editSheet}
            closeOnDragDown={true}
            closeOnPressMask={false}
            customStyles={{
                wrapper: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                },
                draggableIcon: {
                    backgroundColor: "#5DB075"
                },
                container: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 10
                }
            }}>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => setShowStartTime(true)} style={styles.smallInput}>
                    <NormalText center>Start time</NormalText>
                    <View pointerEvents="none">
                        <TextInput
                            value={getTime(startTime)}
                            iconLeft="time-outline"
                            width="100%"
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowEndTime(true)} style={styles.smallInput}>
                    <View pointerEvents="none">
                        <NormalText center>End time</NormalText>
                        <TextInput
                            value={getTime(endTime)}
                            iconLeft="time-outline"
                            width="100%"
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={{...styles.row, marginVertical: 20}}>
              <Button onPress={saveTime}>Save</Button>
              <MediumText>OR</MediumText>
              <BorderedButton color="red" onPress={() => deleteTime(index, dayOfWeek)}>Delete</BorderedButton>
            </View>

            <View>
              <DateTimePickerModal isVisible={showStartTime} date={startTime} style={{width:'100%'}}
                  mode="time" onConfirm={changeStartTime} onCancel={() => setShowStartTime(false)}/>
              <DateTimePickerModal isVisible={showEndTime} date={endTime} style={{width:'100%'}}
                  mode="time" onConfirm={changeEndTime} onCancel={() => setShowEndTime(false)}/>
            </View>
        </RBSheet>
        
        
        <View style={styles.buttons}>
          <Button onPress={() => props.navigation.goBack()}
            marginHorizontal={10} backgroundColor="white"
            color="#5DB075">Cancel</Button>
          <Button onPress={saveAvailabilities}
            marginHorizontal={10}>Save</Button>
        </View>
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

  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },

  row: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  smallInput: {
      width: "48%"
  },
});

export default Availabilities;