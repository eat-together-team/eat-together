import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Section, SectionContent, SectionImage } from "react-native-rapi-ui";
import MediumText from "./MediumText";
import SmallText from "./SmallText";

import getDate from "../getDate";
import getTime from "../getTime";
import NormalText from "./NormalText";

const EventCard = (props) => {
  return (
    <Section style={styles.card} borderRadius={30}>
      <TouchableOpacity onPress={props.click} disabled={props.disabled}>
        <SectionImage
          source={
            props.event.hasImage
              ? { uri: props.event.image }
              : {
                  uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400",
                }
          }
        />

        <SectionContent>
          <MediumText center>{props.event.name}</MediumText>
          {props.event.type !== "recommendation" && <NormalText center>
            By{" "}
            {props.event.hostName
              ? props.event.hostName
              : props.event.hostFirstName // TODO FIX: Not all docs have hostFirstName OR hostName
              ? props.event.hostFirstName +
                " " +
                props.event.hostLastName.substring(0, 1) +
                "."
              : ""}
          </NormalText>}
          <SmallText size={12} center>
            {props.event.location} |{" "}
            {props.event.startDate ? getDate(props.event.startDate.toDate()) : getDate(props.event.date.toDate())} |{" "}
            {props.event.startDate ? getTime(props.event.startDate.toDate()) : getTime(props.event.date.toDate())}
            {props.event.endDate && " - ".concat(getTime(props.event.endDate.toDate()))}
          </SmallText>
        </SectionContent>
      </TouchableOpacity>
    </Section>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 20,
    width: Dimensions.get("window").width - 50,
    marginBottom: 10,
  },

  image: {
    width: Dimensions.get("window").width - 50,
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});

export default EventCard;
