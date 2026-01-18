import React, { useState } from 'react';
import { Image, Text, View, StyleSheet, Linking, Platform} from "react-native";
import MediumText from "./MediumText";
import LargeText from './LargeText';
import Button from './Button';
import ExpandedButton from "./ExpandedButton";

//Presents each restaurant result from YELP API Response
const RestaurantRec = ({restaurant, setIndex, setUserSkipped, setCurrentIndex, setPressedStart, setResult}) => {
    const [expanded, setExpanded] = useState(false);
    // console.log("Rendering restaurant: " + JSON.stringify(restaurant, null, 2));
    const listOfCategories = restaurant.categories.split(', ');
    
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
                source={{ uri: restaurant.imageUrl }}
                style={styles.image}
            />
            <LargeText style = {{marginLeft: 30, marginBottom: 20, marginTop: 30, marginRight: 30,}} color = "#5DB075" numberOfLines={2} ellipsizeMode="tail">{restaurant.name}</LargeText>
            <ExpandedButton setExpanded = {setExpanded} expanded = {expanded}/>
            <View style = {styles.ratingAndCategoryContainer}>
                <View>
                    <MediumText size = {13} lineHeight = {15}>{[listOfCategories[0]]}</MediumText>
                    <MediumText size = {13}>{restaurant.price}  {restaurant.rating}★</MediumText>
                </View>
                {listOfCategories[1] && <MediumText size = {13} lineHeight = {15} style = {{marginRight: 15}}>{listOfCategories[1]}</MediumText>}
            </View>
            {expanded && (
                <View>
                    <View style = {styles.locationContainer}>
                        <MediumText center color = "#5DB075">
                            Location
                        </MediumText>
                        <MediumText onPress ={handleAddressEvent}size = {13} center style = {{marginTop: 7, textDecorationLine: 'underline'}}>{restaurant.address}</MediumText>
                    </View>
                    <View style = {styles.phoneNumberContainer}>
                        <MediumText center color = "#5DB075">Phone Number</MediumText>
                        <MediumText onPress = {handleOpeningPhoneNum} center size = {13} style = {{marginTop: 7, textDecorationLine: 'underline'}}>{restaurant.phone}</MediumText>
                    </View>
                    <View style = {styles.servicesContainer}>
                        <MediumText center color = "#5DB075">Types of Services</MediumText>
                        <MediumText center size = {13} style = {{marginTop: 7}}>{restaurant.serviceOptions}</MediumText>
                    </View>            
                </View>
            )}
                <View>
                    <MediumText center onPress = {handleOpeningURL} marginBottom = {20} lineHeight = {15} size = {13} weight = {600} style = {{textDecorationLine: 'underline'}}>Check it out on Yelp!</MediumText>
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf:'center',
        width: 315,
        height: 'auto', // Changed from fixed height to auto to fit content dynamically
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
        marginTop: 15,
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
    }
});

export default RestaurantRec