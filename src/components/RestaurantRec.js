import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Linking, Platform, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header1Text from "./typography/Header1Text";
import Header3Text from "./typography/Header3Text";
import Header4Text from "./typography/Header4Text";
import BodyText from "./typography/BodyText";
import SubBodyText from "./typography/SubBodyText";
import LabelText from "./typography/LabelText";
import LargeButton from "./LargeButton";
import ExpandedButton from "./ExpandedButton";
import BackButton from "./BackButton";
import StaticMapImage from "./StaticMapImage";
import { useTheme } from '../rapi_ui_components';
import { colorTokens } from '../theme/colorTokens';

//Presents each restaurant result from YELP API Response
const RestaurantRec = ({restaurant, setIndex, setUserSkipped, setCurrentIndex, setPressedStart, setResult, onExpandedChange, onBack}) => {
    const { theme } = useTheme();
    const colors = colorTokens[theme];
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        onExpandedChange?.(expanded);
    }, [expanded, onExpandedChange]);

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
        <View style={styles.emptyContainer}>
            <BodyText color={colors.onBackground} center>
                No Cards Left
            </BodyText>
            <LargeButton
                style={styles.emptyButton}
                onPress={() => {
                    setIndex(0);
                    setUserSkipped(false);
                    setCurrentIndex(0);
                    setPressedStart(false);
                    setResult(undefined);
                }}
            >
                Back To Start
            </LargeButton>
        </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.imageWrapper}>
                <Image
                    source={
                        restaurant.imageUrl
                            ? { uri: restaurant.imageUrl }
                            : require("../../assets/foodBackground.png")
                    }
                    style={styles.image}
                />
                <BackButton onPress={onBack} />
                <ExpandedButton setExpanded={setExpanded} expanded={expanded} />
            </View>

            <View style={styles.content}>
                <View style={styles.textBlock}>
                    <Header1Text color={colors.onBackground} style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                        {restaurant.name}
                    </Header1Text>
                    {!!restaurant.description && (
                        <BodyText color={colors.onBackground} numberOfLines={3} ellipsizeMode="tail">
                            {restaurant.description}
                        </BodyText>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaLeft}>
                        {!!listOfCategories[0] && (
                            <SubBodyText color={colors.onBackground}>{listOfCategories[0]}</SubBodyText>
                        )}
                        <View style={styles.priceRatingRow}>
                            <Header3Text color={colors.onBackground} style={styles.price}>{restaurant.price}</Header3Text>
                            <View style={styles.ratingRow}>
                                <LabelText color={colors.onBackground}>{restaurant.rating}</LabelText>
                                <Ionicons name="star" size={10} color={colors.onBackground} />
                            </View>
                        </View>
                    </View>
                    {!!listOfCategories[1] && (
                        <SubBodyText color={colors.onBackground} style={styles.metaRight}>{listOfCategories[1]}</SubBodyText>
                    )}
                </View>

                {expanded && (
                    <View style={styles.expandedContent}>
                        {!!addressLine1 && (
                            <TouchableOpacity onPress={handleAddressEvent} style={styles.addressRow}>
                                <View style={styles.addressText}>
                                    <Header4Text color={colors.onBackground}>{addressLine1}</Header4Text>
                                    {!!addressLine2 && (
                                        <SubBodyText color={colors.textMedium}>{addressLine2}</SubBodyText>
                                    )}
                                </View>
                                <Ionicons name="map-outline" size={16} color={colors.onBackground} />
                            </TouchableOpacity>
                        )}

                        {!!restaurant.address && (
                            <StaticMapImage lat={restaurant.lat} lng={restaurant.lng} address={restaurant.address} />
                        )}

                        {hasHours && (
                            <View style={[styles.scheduleBox, { backgroundColor: colors.containerLow }]}>
                                {formattedHoursByDay.map(({ day, value }) => (
                                    <View key={day} style={styles.hoursRow}>
                                        <Header4Text color={colors.onBackground} style={styles.hoursDay}>
                                            {day}
                                        </Header4Text>
                                        <SubBodyText
                                            color={colors.onBackground}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {value}
                                        </SubBodyText>
                                    </View>
                                ))}
                            </View>
                        )}

                        {!!restaurant.photos && restaurant.photos.length > 0 && (
                            <View style={styles.photosWrapper}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
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
                                <LinearGradient
                                    colors={[`${colors.background}00`, colors.background]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.photosFade}
                                    pointerEvents="none"
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: 347,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 4,
    },
    imageWrapper: {
        width: '100%',
        height: 302,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 22,
        paddingBottom: 15,
        gap: 31,
    },
    textBlock: {
        gap: 8,
    },
    name: {
        fontSize: 30,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    metaLeft: {
        gap: 5,
    },
    priceRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    price: {
        fontSize: 13,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaRight: {
        textAlign: 'right',
    },
    expandedContent: {
        gap: 20,
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressText: {
        gap: 2,
    },
    scheduleBox: {
        borderRadius: 10,
        paddingVertical: 18,
        gap: 8,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
    },
    hoursDay: {
        width: 45,
    },
    photosWrapper: {
        position: 'relative',
    },
    photosContainer: {
        gap: 15,
    },
    photoThumb: {
        width: 114,
        height: 114,
        borderRadius: 10,
    },
    photosFade: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 36,
    },
    emptyContainer: {
        width: 315,
        alignItems: 'center',
        paddingVertical: 40,
        gap: 20,
    },
    emptyButton: {
        width: 200,
    },
});

export default RestaurantRec;
