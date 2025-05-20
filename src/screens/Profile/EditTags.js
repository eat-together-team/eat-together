import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Layout } from "react-native-rapi-ui";
import RBSheet from "react-native-raw-bottom-sheet";
import { Ionicons } from "@expo/vector-icons"; // For back arrow icon

import { Text } from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import SmallText from "../../components/SmallText";
import NormalText from "../../components/NormalText";

import TextInput from "../../components/TextInput";
import TagsSection from "../../components/TagsSection";
import Button from "../../components/Button";

import schoolTags from "../../schoolTags";
import hobbyTags from "../../hobbyTags";
import foodTags from "../../foodTags";
import goalTags from "../../goalTags";
import { cloneDeep } from "lodash";

const EditTags = props => {
  // Tags
  const [schoolTagsSelected, setSchoolTagsSelected] = useState(props.route.params.schoolTags);
  const [goalTagsSelected, setGoalTagsSelected] = useState(props.route?.params?.goalTags ?? ["Eat Healthy"]);
  const [hobbyTagsSelected, setHobbyTagsSelected] = useState(props.route.params.hobbyTags);
  const [foodTagsSelected, setFoodTagsSelected] = useState(props.route.params.foodTags);
  const [schoolTagsValue, setSchoolTagsValue] = useState("");
  const [hobbyTagsValue, setHobbyTagsValue] = useState("");
  const [foodTagsValue, setFoodTagsValue] = useState("");
  const [goalTagsValue, setGoalTagsValue] = useState("");

  // Determine which category is open in the drawer
  const [school, setSchool] = useState(false);
  const [hobby, setHobby] = useState(false);
  const [goal, setGoal] = useState(false);
  const [food, setFood] = useState(false);

  const refRBSheet = useRef(); // To toggle the bottom drawer on/off

  // Determines text to display for tags
  useEffect(() => {
      let tags = "";
      if (schoolTagsSelected.length > 0) {
          tags += schoolTagsSelected[0];
      }

      for (let i = 1; i < schoolTagsSelected.length; i++) {
          tags += ", " + schoolTagsSelected[i];
      }

      setSchoolTagsValue(tags);
  }, [schoolTagsSelected]);

  useEffect(() => {
      let tags = "";
      if (hobbyTagsSelected.length > 0) {
          tags += hobbyTagsSelected[0];
      }

      for (let i = 1; i < hobbyTagsSelected.length; i++) {
          tags += ", " + hobbyTagsSelected[i];
      }

      setHobbyTagsValue(tags);
  }, [hobbyTagsSelected]);

  useEffect(() => {
      let tags = "";
      if (foodTagsSelected.length > 0) {
          tags += foodTagsSelected[0];
      }

      for (let i = 1; i < foodTagsSelected.length; i++) {
          tags += ", " + foodTagsSelected[i];
      }

      setFoodTagsValue(tags);
  }, [foodTagsSelected]);

  useEffect(() => {
    let tags = "";
    if (goalTagsSelected.length > 0) {
        tags += goalTagsSelected[0];
    }

    for (let i = 1; i < goalTagsSelected.length; i++) {
        tags += ", " + goalTagsSelected[i];
    }

    setGoalTagsValue(tags);
}, [goalTagsSelected]);

  return (
    //header w/ back button 
    <Layout style={styles.page}>
        {/* Header with back arrow and title */}
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => props.navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <MediumText>Edit Tags</MediumText>
            </View>
        </View>
        
        {/* Divider line */}
        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent}>

        //hobbies
        <View style={styles.tagSection}>
        <NormalText left marginBottom={10} style={{ fontSize: 14, fontFamily: 'Inter_700Bold' }}> 
            Hobbies
        </NormalText>
                <NormalText left marginBottom={5}>Select your hobbies</NormalText>
                <View style={styles.tagsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {hobbyTagsSelected.map((tag, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.chip}
                    onPress={() => {
                    // Remove tag when chip is pressed
                    const newTags = hobbyTagsSelected.filter((_, i) => i !== index);
                    setHobbyTagsSelected(newTags);
                    }}
                >
                    <NormalText style={{fontSize: 14, color: 'white' }}>{tag}</NormalText>
                </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                onPress={() => {
                setSchool(false);
                setFood(false);
                setHobby(true);
                setGoal(false);
                refRBSheet.current.open();
                }}
                style={styles.addTagButton}
            >
                <Ionicons name="add-circle-outline" size={24} color="#5DB075" />
                <SmallText style={{ marginLeft: 4, color: "#5DB075" }}>Add</SmallText>
            </TouchableOpacity>
            </View>
            </View>

        //about me
        <View style={styles.tagSection}>
            <NormalText left marginBottom={5} style={{ fontSize: 14, fontFamily: 'Inter_700Bold' }}>
                About Me
            </NormalText>
            <NormalText left marginBottom={5}>Select what represents you</NormalText>

            {/* Wrap tags and add button in a row container */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
                >
                {schoolTagsSelected.map((tag, index) => (
                    <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => {
                        const newTags = schoolTagsSelected.filter((_, i) => i !== index);
                        setSchoolTagsSelected(newTags);
                    }}
                    >
                    <NormalText style={{ fontSize: 14, color: 'white' }}>{tag}</NormalText>
                    </TouchableOpacity>
                ))}
                </ScrollView>

                <TouchableOpacity
                onPress={() => {
                    setSchool(true);
                    setFood(false);
                    setHobby(false);
                    setGoal(false);
                    refRBSheet.current.open();
                }}
                style={[styles.addTagButton, { marginLeft: 8 }]} 
                >
                <Ionicons name="add-circle-outline" size={24} color="#5DB075" />
                <SmallText style={{ marginLeft: 4, color: "#5DB075" }}>Add</SmallText>
                </TouchableOpacity>
                </View>
            </View>


        
            <View style={styles.tagSection}>
                <NormalText left marginBottom={5} style={{ fontSize: 14, fontFamily: 'Inter_700Bold' }}> 
                    I'm looking to
                </NormalText>
                <NormalText left marginBottom={5}>Select your goals</NormalText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
                >
                {goalTagsSelected.map((tag, index) => (
                    <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => {
                        const newTags = goalTagsSelected.filter((_, i) => i !== index);
                        setGoalTagsSelected(newTags);
                    }}
                    >
                    <NormalText style={{ fontSize: 14, color: 'white' }}>{tag}</NormalText>
                    </TouchableOpacity>
                ))}
                </ScrollView>

                <TouchableOpacity
                onPress={() => {
                    setSchool(false);
                    setFood(false);
                    setHobby(false);
                    setGoal(true);
                    refRBSheet.current.open();
                }}
                style={[styles.addTagButton, { marginLeft: 8 }]} // Add spacing from ScrollView
                >
                <Ionicons name="add-circle-outline" size={24} color="#5DB075" />
                <SmallText style={{ marginLeft: 4, color: "#5DB075" }}>Add</SmallText>
                </TouchableOpacity>
                </View>
            </View>

            
            <View style={styles.tagSection}>
                 <NormalText left marginBottom={5} style={{ fontSize: 14, fontFamily: 'Inter_700Bold' }}> 
                    Food Preferences
                </NormalText>
                <NormalText left marginBottom={5}>Select your food preferences</NormalText>
                {/* Wrap tags and add button in a row container */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
                >
                {foodTagsSelected.map((tag, index) => (
                    <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => {
                        const newTags = foodTagsSelected.filter((_, i) => i !== index);
                        setFoodTagsSelected(newTags);
                    }}
                    >
                    <NormalText style={{ fontSize: 14, color: 'white' }}>{tag}</NormalText>
                    </TouchableOpacity>
                ))}
                </ScrollView>

                <TouchableOpacity
                onPress={() => {
                    setSchool(false);
                    setFood(true);
                    setHobby(false);
                    setGoal(false);
                    refRBSheet.current.open();
                }}
                style={[styles.addTagButton, { marginLeft: 8 }]} // Add spacing from ScrollView
                >
                <Ionicons name="add-circle-outline" size={24} color="#5DB075" />
                <SmallText style={{ marginLeft: 4, color: "#5DB075" }}>Add</SmallText>
                </TouchableOpacity>
                </View>
            </View>

   
            <View style={styles.buttons}>
                <Button 
                    onPress={() => {
                        props.route.params.updateTags(schoolTagsSelected, hobbyTagsSelected, foodTagsSelected, goalTagsSelected);
                        props.navigation.goBack();
                        alert("Tags saved! Click on 'Update Profile' to update your profile.");
                    }}
                    disabled={schoolTagsSelected.length < 1 || schoolTagsSelected.length > 4 || 
                        hobbyTagsSelected.length < 1 || hobbyTagsSelected.length > 4 || 
                        foodTagsSelected.length < 1 || foodTagsSelected.length > 4 }
                         width="100%" 
                         paddingVertical={15}
                    style={styles.updateButton}
                >
                    Update Tags
                </Button>
            </View>
        </ScrollView>

        <RBSheet
            height={400}
            ref={refRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
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
            {school ? (
            <View>
                <MediumText center marginBottom={5}>School</MediumText>
                <NormalText center marginBottom={5}>E.g. year, major</NormalText>
                <TagsSection
                    multi={true}
                    selectedItems={schoolTagsSelected}
                    onItemSelect={(item) => {
                        if (schoolTagsSelected.length >= 4) {
                            alert("You can only select up to 4 tags.");
                        } else {
                            setSchoolTagsSelected([...schoolTagsSelected, item]);
                        }
                    }}
                    onRemoveItem={(item, index) => {
                        const newTags = schoolTagsSelected.filter((tag, i) => i !== index);
                        setSchoolTagsSelected(newTags);
                    }}
                    items={cloneDeep(schoolTags)}
                    chip={true}
                    resetValue={false}
                />
            </View>
            ) : hobby ? (
            <View>
                <MediumText center marginBottom={5}>Hobbies</MediumText>
                <NormalText center marginBottom={5}>E.g. sports, reading</NormalText>
                <TagsSection
                    multi={true}
                    selectedItems={hobbyTagsSelected}
                    onItemSelect={(item) => {
                        if (hobbyTagsSelected.length >= 4) {
                            alert("You can only select up to 4 tags.");
                        } else {
                            setHobbyTagsSelected([...hobbyTagsSelected, item]);
                            
                        }
                    }}
                    onRemoveItem={(item, index) => {
                        const newTags = hobbyTagsSelected.filter((tag, i) => i !== index);
                        setHobbyTagsSelected(newTags);
                    }}
                    items={cloneDeep(hobbyTags)}
                    chip={true}
                    resetValue={false}
                />
            </View>
            ) : goal ? (
                <View>
                    <MediumText center marginBottom={5}>Goals</MediumText>
                    <NormalText center marginBottom={5}>E.g. meeting friends, trying foods</NormalText>
                    <TagsSection
                        multi={true}
                        selectedItems={goalTagsSelected}
                        onItemSelect={(item) => {
                            if (goalTagsSelected.length >= 4) {
                                alert("You can only select up to 4 tags.");
                            } else {
                                setGoalTagsSelected([...goalTagsSelected, item]);
                            }
                        }}
                        onRemoveItem={(item, index) => {
                            const newTags = goalTagsSelected.filter((tag, i) => i !== index);
                            setGoalTagsSelected(newTags);
                        }}
                        items={cloneDeep(goalTags)}
                        chip={true}
                        resetValue={false}
                    />
                </View>
                ) : food ? (
                    <View>
                      <MediumText center marginBottom={5}>Food-related</MediumText>
                      <NormalText center marginBottom={5}>E.g. vegetarian, spicy food</NormalText>
                      <TagsSection
                        multi={true}
                        selectedItems={foodTagsSelected}
                        onItemSelect={(item) => {
                          if (foodTagsSelected.length >= 4) {
                            alert("You can only select up to 4 tags.");
                          } else {
                            setFoodTagsSelected([...foodTagsSelected, item]);
                          }
                        }}
                        onRemoveItem={(item, index) => {
                          const newTags = foodTagsSelected.filter((tag, i) => i !== index);
                          setFoodTagsSelected(newTags);
                        }}
                        items={cloneDeep(foodTags)}
                        chip={true}
                        resetValue={false}
                      />
                    </View>
                  ) : null }
        </RBSheet>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30, // To account for status bar
    paddingHorizontal: 16,
    paddingBottom: 10
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // To offset the back button and center the title
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    width: "100%"
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  tagSection: {
    marginBottom: 20,
    width: "100%",
    justifyContent: "center"
  },
  buttons: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },
  updateButton: {
    width: "100%",
    backgroundColor: "#5DB075",
    paddingVertical: 15,
    borderRadius: 10
  }, 
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#5DB075",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 15
  },
  chipText: {
    fontFamily: "Inter_300Light",
    color: "#FFFFFF"
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
  }
});

export default EditTags;