import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Linking, Platform, ScrollView} from "react-native";
import MediumText from "./MediumText";
import SmallText from "./SmallText";
import LargeText from './LargeText';
import Button from './Button';
import ExpandedButton from "./ExpandedButton";
import BackButton from "./BackButton";

//Presents each restaurant result from YELP API Response
const RestaurantRec = ({restaurant, setIndex, setUserSkipped, setCurrentIndex, setPressedStart, setResult, onExpandedChange, onBack}) => {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        onExpandedChange?.(expanded);
    }, [expanded, onExpandedChange]);

    // console.log("Rendering restaurant: " + JSON.stringify(restaurant, null, 2));
    const listOfCategories = restaurant?.categories
        ? restaurant.categories.split(', ')
        : [];

    const addressParts = restaurant?.address
        ? restaurant.address.split(', ')
        : [];
    const addressLine1 = addressParts[0] || '';
    const addressLine2 = addressParts.slice(1).join(', ') || '';

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const formatTime = (hhmm) => {
        if (!hhmm || hhmm.length !== 4) return '';
        const hour24 = parseInt(hhmm.slice(0, 2), 10);
        const minutes = hhmm.slice(2);
        const suffix = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 || 12;
        return `${hour12}:${minutes} ${suffix}`;
    };

    const formattedHoursByDay = (() => {
        const hoursData = restaurant?.hours?.[0]?.open || [];
        if (!hoursData.length) return [];

        return dayNames.map((dayLabel, dayIndex) => {
            const entriesForDay = hoursData.filter((h) => h.day === dayIndex);
            if (!entriesForDay.length) {
                return { day: dayLabel, value: 'Closed' };
            }
            const ranges = entriesForDay.map((h) => {
                const start = formatTime(h.start);
                const end = formatTime(h.end);
                return `${start} - ${end}`;
            });
            return { day: dayLabel, value: ranges.join(', ') };
        });
    })();
    const hasHours = formattedHoursByDay.length > 0;
    
    // Opens Yelp app (or browser)
    const handleOpeningURL = async() =>{
        await Linking.openURL(restaurant.url);
    }

    // Opens native phone app
    const handleOpeningPhoneNum = async() =>{
        await Linking.openURL(`tel:${restaurant.phone}`);
    }

    // Opens address on maps (Google, apple, web as fallback)
    const handleAddressEvent = async() => { 
        const encodedAddress = encodeURIComponent(restaurant.address);

        const url = Platform.select({
            ios: `maps://app?q=${encodedAddress}`,
            android: `geo:0,0?q=${encodedAddress}`,
            default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        });
        
        console.log(url);
        try {
            const supported = await Linking.canOpenURL(url);
            
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback to Google Maps web
                const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                await Linking.openURL(webUrl);
            }
        } catch (error) {
            console.error('Error opening maps:', error);
        }
    }

    if (!restaurant){
        return (
        <View style = {{width: 400, height: 600, justifyContent:'center', alignItems:'center'}}>
            <MediumText center = {true} marginBottom = {20}>
                No Cards Left
            </MediumText>
            <Button onPress = {()=> 
                {
                    setIndex(0);
                    setUserSkipped(false);
                    setCurrentIndex(0);
                    setPressedStart(false);
                    setResult(undefined);
                }
                }>
                Back To Start
            </Button>
        </View>
        )
    }

    return (
        <View style = {styles.container}>
            <Image
                source={
                    restaurant.imageUrl
                        ? { uri: restaurant.imageUrl }
                        : require("../../assets/foodBackground.png")
                }
                style={styles.image}
            />

            <BackButton onPress={onBack} />
            <ExpandedButton setExpanded = {setExpanded} expanded = {expanded}/>
            <View style = {styles.ratingAndCategoryContainer}>
                <View>
                    <MediumText size = {13} lineHeight = {15}>{[listOfCategories[0]]}</MediumText>
                    <MediumText size = {13}>{restaurant.price}  {restaurant.rating}★</MediumText>
                </View>
                {listOfCategories[1] && <MediumText size = {13} lineHeight = {15} style = {{marginRight: 30}}>{listOfCategories[1]}</MediumText>}
            </View>

            <View>
                <LargeText
                    style={{ marginHorizontal: 30, marginBottom: 10}}
                    color="#5DB075"
                    center
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {restaurant.name}
                </LargeText>
                <SmallText center style={{ marginHorizontal: 30 }}>
                    {restaurant.description}
                </SmallText>
            </View>
            {expanded && (
                <View>
                    <View style = {styles.locationContainer}>
                        <MediumText center color = "#5DB075">
                            {hasHours ? 'Location & Hours' : 'Location'}
                        </MediumText>
                        {!!addressLine1 && (
                            <MediumText
                                onPress={handleAddressEvent}
                                size={13}
                                center
                                style={{ marginTop: 6, textDecorationLine: 'underline' }}
                            >
                                {addressLine1}
                            </MediumText>
                        )}
                        {!!addressLine2 && (
                            <MediumText
                                size={13}
                                center
                                style={{ marginTop: -2, marginBottom: 6 }}
                            >
                                {addressLine2}
                            </MediumText>
                        )}
                        {formattedHoursByDay.map(({ day, value }) => (
                            <View key={day} style={styles.hoursRow}>
                                <MediumText size={13} style={styles.hoursDay}>
                                    {day}
                                </MediumText>
                                <MediumText
                                    size={13}
                                    style={styles.hoursText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {value}
                                </MediumText>
                            </View>
                        ))}
                    </View>
                    {!!restaurant.photos && restaurant.photos.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.photosScroll}
                            contentContainerStyle={styles.photosContainer}
                        >
                            {restaurant.photos.map((photoUrl) => (
                                <Image
                                    key={photoUrl}
                                    source={{ uri: photoUrl }}
                                    style={styles.photoThumb}
                                />
                            ))}
                        </ScrollView>
                    )}
                    {/* <View style = {styles.phoneNumberContainer}>
                        <MediumText center color = "#5DB075">Phone Number</MediumText>
                        <MediumText onPress = {handleOpeningPhoneNum} center size = {13} style = {{marginTop: 7, textDecorationLine: 'underline'}}>{restaurant.phone}</MediumText>
                    </View> */}
                </View>
            )}
                {/* <View>
                    <MediumText center onPress = {handleOpeningURL} marginBottom = {20} lineHeight = {15} size = {13} weight = {600} style = {{textDecorationLine: 'underline'}}>Check it out on Yelp!</MediumText>
                </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf:'center',
        width: 315,
        height: 'auto',
        marginTop: 40,
        borderWidth: 0.2,
        borderRadius: 40,
    },
    image: {
        width: 315,
        height: 290,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    ratingAndCategoryContainer:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop: 24,
        marginBottom: 5,
        marginLeft: 30,
    },
    locationContainer:{
        marginTop: 5
    },
    phoneNumberContainer:{
        marginTop: 5,
    },
    servicesContainer:{
        marginTop: 5,
        marginBottom: 5,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 2,
        paddingHorizontal: 55,
        width: '100%',
    },
    hoursDay: {
        minWidth: 60,
        textAlign: 'left',
        marginRight: 8,
        flexShrink: 0,
    },
    hoursText: {
        flex: 1,
        textAlign: 'left',
    },
    photosScroll: {
        marginTop: 10,
        marginBottom: 16,
    },
    photosContainer: {
        paddingHorizontal: 15,
    },
    photoThumb: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 6,
    },
});

export default RestaurantRec;

