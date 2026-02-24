import React from "react";
import { View, ImageBackground, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import NormalText from "./NormalText";
import SmallText from "./SmallText";
import getDate from "../utils/getDate";

const EventsRow = props => {
    const events = props.events || [];
    
    if (events.length === 0) {
        return null;
    }
    
    return(
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            style={styles.scrollView}
        >
            {events.map((event, index) => {
                const eventDate = event.startDate 
                    ? event.startDate.toDate() 
                    : event.date 
                    ? event.date.toDate() 
                    : null;
                
                // Format date with day of week, month abbreviation, and day (e.g., "Monday, Jan. 15")
                const formattedDate = eventDate ? getDate(eventDate, true) : '';
                
                return (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.eventContainer}
                        onPress={() => props.onEventPress && props.onEventPress(event)}
                    >
                        <ImageBackground
                            source={
                                event.hasImage && event.image
                                ? { uri: event.image }
                                : require("../../assets/foodBackground.png")
                            }
                            style={[styles.image, { width: 150, height: 150 }]}
                            imageStyle={styles.imageStyle}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.85)']}
                                locations={[0, 0.5, 1]}
                                style={styles.gradientOverlay}
                            />
                            <View style={styles.textOverlay}>
                                <NormalText style={styles.title} numberOfLines={2} color="white">
                                    {event.name || 'Event'}
                                </NormalText>
                                {formattedDate && (
                                    <SmallText style={styles.date} color="white">
                                        {formattedDate}
                                    </SmallText>
                                )}
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>        
    );
}

const styles = StyleSheet.create({ 
  scrollView: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  eventContainer: {
    margin: 5,
    width: 150,
    alignItems: "center",
  },
  image: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderRadius: 10,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 8,
  },
  title: {
    textAlign: "left",
    width: "100%",
  },
  date: {
    marginTop: 2,
    textAlign: "left",
    width: "100%",
  },
});
  
export default EventsRow;
