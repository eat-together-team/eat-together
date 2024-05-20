// Display Personal Photo Gallery

import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import MediumText from "../../components/MediumText";


import { getTimeOfDay, isAvailable, compareDates } from "../../methods";
import { auth, db } from "../../provider/Firebase";
import { Divider } from "react-native-elements";

export default function Gallery({ navigation }) {
    // Filters
    const [event, setEvent] = useState(false);
    const [newest, setNewest] = useState(false);
    const [oldest, setOldest] = useState(false);
    const [grid, setGrid] = useState(false);
    const [column, setColumn] = useState(false);

    const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

    const [filteredImages, setFilteredImages] = useState([]); // Filtered Images
    //Rendering filters
    return(
        <Layout >
            <View>
            <TopNav
                middleContent={
                    <MediumText>Your Photo Gallery</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
                <Button style={styles.button}> Add Photos </Button>
                <Divider></Divider>
                <MediumText style={{ paddingVertical: 10, paddingHorizontal: 10 }}>Sort By</MediumText>
            <HorizontalRow style={{ paddingHorizontal: 20 }}> 
                <Filter checked={event}
                onPress={() => setEvent(!event)} text="Event"/>
                <Filter checked={newest}
                onPress={() => setNewest(!event)} text="Newest"/>
                <Filter checked={oldest}
                onPress={() => setOldest(!oldest)} text="Oldest"/>
                <Filter checked={grid}
                onPress={() => setGrid(!grid)} text="Grid"/>
                <Filter checked={column}
                onPress={() => setGrid(!column)} text="Column"/>
            </HorizontalRow>
            </View>
        </Layout>
        );

    // For filters
    useEffect(() => { async function filter() {
      setLoading(true);
      let newImages = [...Images];

      if (newest) {
        newImages = filterByNewest(newEvents);
      }

      if (oldest) {
        newImages = filterByOldest(newEvents);
      }

      setFilteredImages(newImages);
    }

    if (images.length > 0) {
      filter().then(() => setLoading(false));
    }
  }, [
    events,
    newest, 
    oldest, 
    grid, 
    column
  ]);

  const filterByNewest = (newEvents) => {
    newImages = newImages.sort((a, b) => {
        return a.imageUploadedTime - b.imageUploadedTime;
    });
    return newImages;
  };

  const filterByOldest = (newEvents) => {
    newImages = newImages.sort((a, b) => {
        return b.imageUploadedTime - a.imageUploadedTime;
    });
    return newImages;
  };


}

const styles = StyleSheet.create({
    
    button: {
        position: "relative",
        bottom: 10,
        right: 10,
        alignItems: "center",
        color:'white',
    }
  
  });
  
