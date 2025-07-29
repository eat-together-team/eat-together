import React, { useState } from 'react';
import { Image, Text, View, StyleSheet, Linking, Platform} from "react-native";
import SmallText from "./SmallText";
import MediumText from "./MediumText";
import LargeText from './LargeText';
import ExpandedButton from "./ExpandedButton";
import Button from './Button';

//Presents each restaurant result from YELP API Response
const RestaurantRec = ({restaurant, setIndex, setUserSkipped, setCurrentIndex, setPressedStart, setResult}) => {
    const [expanded, setExpanded] = useState(false);
    
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
                source={{ uri: restaurant.image }}
                style={styles.image}
            />
            <ExpandedButton setExpanded = {setExpanded} expanded = {expanded}/>
            <View style = {styles.ratingAndCategoryContainer}>
                <View>
                    <MediumText size = {13} >{restaurant.categoryAliases[0]?.charAt(0).toUpperCase() + restaurant.categoryAliases[0]?.substring(1)}</MediumText>
                    <MediumText size = {13}>{restaurant.price}  {restaurant.rating}★</MediumText>
                </View>
                <MediumText style = {{marginRight: 10}} size = {13}>{restaurant.categoryAliases[1]?.charAt(0).toUpperCase() + restaurant.categoryAliases[1]?.substring(1)}</MediumText>
            </View>
            <LargeText style = {{marginLeft: 30, marginBottom: 20}} marginBottom ={15} color = "#5DB075">{restaurant.name}</LargeText>
            <View style = {styles.reviewContainer}>
                <MediumText size = {13} weight = {600} >"{restaurant.reviewExcerpt}"</MediumText>
            </View>
            {expanded && (
                <View>
                    <View style = {styles.locationContainer}>
                        <MediumText center color = "#5DB075">
                            Location & Hours
                        </MediumText>
                        <MediumText onPress ={handleAddressEvent}size = {13} center style = {{marginTop: 7, textDecorationLine: 'underline'}}>{restaurant.address}</MediumText>
                    </View>
                    <View style={styles.timeContainer}>
                        {Object.entries(restaurant.hours).map(([day, time]) => (
                            <MediumText key={day} size={13} style={{marginBottom: 5}}>
                                {day}:  {time}
                            </MediumText>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf:'center',
        width: 315,
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
    reviewContainer:{
        width: 240,
        alignSelf:'center',
        marginRight: 20
    },
    ratingAndCategoryContainer:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop: 15,
        marginBottom: 20,
        marginLeft: 30,
    },
    locationContainer:{
        marginTop: 20
    },
    timeContainer:{
        marginTop: 20,
        alignSelf: 'center',
        marginBottom: 20,
    }

});

export default RestaurantRec