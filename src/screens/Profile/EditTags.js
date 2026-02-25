// Specify availabilities for days of the week

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { Layout } from "../../rapi_ui_components";
import RBSheet from "react-native-raw-bottom-sheet";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";

import TextInput from "../../components/TextInput";
import TagsSection from "../../components/TagsSection";
import Button from "../../components/Button";

import schoolTags from "../../utils/schoolTags";
import hobbyTags from "../../utils/hobbyTags";
import foodTags from "../../utils/foodTags";
import { cloneDeep } from "lodash";

const EditTags = props => {
  // Tags
  const [schoolTagsSelected, setSchoolTagsSelected] = useState(props.route.params.schoolTags);
  const [hobbyTagsSelected, setHobbyTagsSelected] = useState(props.route.params.hobbyTags);
  const [foodTagsSelected, setFoodTagsSelected] = useState(props.route.params.foodTags);
  const [schoolTagsValue, setSchoolTagsValue] = useState("");
  const [hobbyTagsValue, setHobbyTagsValue] = useState("");
  const [foodTagsValue, setFoodTagsValue] = useState("");

  // Determine which category is open in the drawer
  const [school, setSchool] = useState(false);
  const [hobby, setHobby] = useState(false);
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

  return (
    <Layout style={styles.page}>
        <ScrollView contentContainerStyle={{ alignItems: "center" }}>
            {/* Keep the heading but align the hierarchy with the new edit profile look. */}
            <LargeText center marginBottom={10}>Edit Tags</LargeText>

            <NormalText center size={12}>Note: each of the 3 categories below must contain:</NormalText>
            <MediumText center size={12} marginBottom={20}>Minimum 1 tag, maximum 4 tags</MediumText>

            {/* Dashed card for School tags to match the mock's tag containers. */}
            <View style={[styles.tagSection, styles.tagCard, styles.tagCardGold]}>
                <MediumText center marginBottom={5}>School</MediumText>
                <NormalText center marginBottom={5}>E.g. year, major</NormalText>
                <TouchableOpacity onPress={() => {
                    setHobby(false);
                    setFood(false);
                    setSchool(true);
                    refRBSheet.current.open();
                }}>
                    <View pointerEvents="none">
                        <TextInput
                            width="100%"
                            placeholder="Tags"
                            value={schoolTagsValue}
                            iconLeft="pricetags-outline"
                            editable={false}
                            required
                            mainContainerStyle={styles.tagInputContainer}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Dashed card for Hobbies tags with blue tint. */}
            <View style={[styles.tagSection, styles.tagCard, styles.tagCardBlue]}>
                <MediumText center marginBottom={5}>Hobbies</MediumText>
                <NormalText center marginBottom={5}>E.g. sports, reading</NormalText>
                <TouchableOpacity onPress={() => {
                    setSchool(false);
                    setFood(false);
                    setHobby(true);
                    refRBSheet.current.open();
                }}>
                    <View pointerEvents="none">
                        <TextInput
                            width="100%"
                            placeholder="Tags"
                            value={hobbyTagsValue}
                            iconLeft="pricetags-outline"
                            editable={false}
                            required
                            mainContainerStyle={styles.tagInputContainer}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Dashed card for Food tags with purple tint. */}
            <View style={[styles.tagSection, styles.tagCard, styles.tagCardPurple]}>
                <MediumText center marginBottom={5}>Food-related</MediumText>
                <NormalText center marginBottom={5}>E.g. favorite dishes, favorite cuisine</NormalText>
                <TouchableOpacity onPress={() => {
                    setSchool(false);
                    setHobby(false);
                    setFood(true);
                    refRBSheet.current.open();
                }}>
                    <View pointerEvents="none">
                        <TextInput
                            width="100%"
                            placeholder="Tags"
                            value={foodTagsValue}
                            iconLeft="pricetags-outline"
                            editable={false}
                            required
                            mainContainerStyle={styles.tagInputContainer}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.buttons}>
                <Button onPress={() => props.navigation.goBack()}
                    marginHorizontal={10}>Cancel</Button>
                <Button onPress={() => {
                    props.route.params.updateTags(schoolTagsSelected, hobbyTagsSelected, foodTagsSelected);
                    props.navigation.goBack();
                    alert("Tags saved! Click on 'Update Profile' to update your profile.");
                }}
                disabled={schoolTagsSelected.length < 1 || schoolTagsSelected.length > 4 || hobbyTagsSelected.length < 1
                    || hobbyTagsSelected.length > 4 || foodTagsSelected.length < 1 || foodTagsSelected.length > 4}
                marginHorizontal={10}>Save</Button>
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
            ) : (
            <View>
                <MediumText center marginBottom={5}>Food-related</MediumText>
                <NormalText center marginBottom={5}>E.g. favorite dishes, favorite cuisine</NormalText>
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
            )}
        </RBSheet>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    width: Dimensions.get('screen').width,
    paddingHorizontal: 10,
    paddingVertical: 30
  },

  tagSection: {
    marginBottom: 20,
    width: "90%",
    justifyContent: "center"
  },

  // Dashed card styling to match the tag groups in the mock.
  tagCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8
  },

  // Subtle color tints for each category card (visual grouping).
  tagCardGold: {
    borderColor: "#F7E7B0"
  },

  tagCardBlue: {
    borderColor: "#BFE1FA"
  },

  tagCardPurple: {
    borderColor: "#E6C7F4"
  },

  // Input container tweak to keep TextInput visually light inside cards.
  tagInputContainer: {
    backgroundColor: "white"
  },

  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40
  }  
});

export default EditTags;