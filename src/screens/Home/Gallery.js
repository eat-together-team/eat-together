// Display Personal Photo Gallery

import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";


import { getTimeOfDay, isAvailable, compareDates } from "../../methods";
import { auth, db } from "../../provider/Firebase";

export default function Gallery({ navigation }) {
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});

    return(
        <Layout>

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
            </View>
        </Layout>
    );

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
  
