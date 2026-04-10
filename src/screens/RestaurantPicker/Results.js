import React, { useEffect, useMemo, useState } from "react";
import {View, Modal, StyleSheet, FlatList, Image, TouchableOpacity} from "react-native";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import SmallText from "../../components/SmallText";
import Button from "../../components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import firebase from "firebase/compat/app";
import { auth, db } from "../../provider/Firebase";

function pickRestaurantForProfile(item) {
    return {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        categories: item.categories || "",
        price: item.price || "",
        rating: item.rating || "",
        url: item.url || "",
        reviewCount: item.reviewCount || item.review_count || "",
        address: item.address || "",
        phone: item.phone || item.display_phone || "",
        serviceOptions: item.serviceOptions || "",
        hours: item.hours || null,
        photos: Array.isArray(item.photos) ? item.photos.slice(0, 6) : [],
    };
}

function normalizeRestaurantId(id) {
    if (id === null || id === undefined) return "";
    return String(id);
}

function dedupeRestaurants(restaurants) {
    const list = Array.isArray(restaurants) ? restaurants : [];
    const seen = new Set();
    const out = [];
    for (const r of list) {
        const rid = normalizeRestaurantId(r?.id);
        if (!rid) continue;
        if (seen.has(rid)) continue;
        seen.add(rid);
        out.push({ ...r, id: rid });
    }
    return out;
}

const ResultItem = ({ item, starred, onToggleStar }) => {
    const rawCategories = item.categories || "";
    const primaryCategory = rawCategories.includes(",")
        ? rawCategories.substring(0, rawCategories.indexOf(","))
        : rawCategories;
    const hasCategory = primaryCategory.trim().length > 0;

    return (
        <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
                <Image         
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                />
            </View>
            <View style={[styles.textContainer, { flex: 1, flexDirection: 'row' }]}>
                <View style={{ flex: 1 }}>
                    <MediumText
                        style={{ lineHeight: 20, paddingBottom: 5 }}
                        size={18}
                    >
                        {item.name}
                    </MediumText>
                    {hasCategory && (
                        <MediumText color="#5DB075" size={11} style={{ lineHeight: 12 }}>
                            {primaryCategory}
                        </MediumText>
                    )}
                    <View style={styles.ratingAndPriceContainer}>
                        <MediumText paddingHorizontal={2} color="#5DB075" size={11}>
                            {item.price}
                        </MediumText>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MediumText color="#5DB075" size={11}>
                                {item.rating}
                            </MediumText>
                            <Ionicons
                                name="star"
                                size={10}
                                color="#5DB075"
                                style={{ marginLeft: 2 }}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.iconColumn}>
                    <TouchableOpacity onPress={() => onToggleStar && onToggleStar(item, !starred)}>
                        <Ionicons
                            name={starred ? "star" : "star-outline"}
                            size={22}
                            color={starred ? "#F5C542" : undefined}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const Results = ({userResults, resultVisible, setResultVisible, setResult}) => {
    // redirect to profile page
    const navigation = useNavigation();
    const user = auth.currentUser;
    const [starredRestaurants, setStarredRestaurants] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsub = db
            .collection("Users")
            .doc(user.uid)
            .onSnapshot((doc) => {
                const data = doc.data() || {};
                setStarredRestaurants(dedupeRestaurants(data.starredRestaurants));
            });

        return () => unsub && unsub();
    }, [user?.uid]);

    const starredIds = useMemo(() => {
        return new Set((starredRestaurants || []).map(r => normalizeRestaurantId(r?.id)).filter(Boolean));
    }, [starredRestaurants]);

    const handleToggleStar = async (restaurant, nextStarred) => {
        if (!user?.uid) return;

        const pickedRaw = pickRestaurantForProfile(restaurant);
        const picked = { ...pickedRaw, id: normalizeRestaurantId(pickedRaw.id) };
        const current = dedupeRestaurants(starredRestaurants);

        const next = nextStarred
            ? dedupeRestaurants([picked, ...current])
            : current.filter(r => normalizeRestaurantId(r?.id) !== picked.id);

        try {
            await db.collection("Users").doc(user.uid).update({
                starredRestaurants: next,
                starredRestaurantIDs: next.map(r => r.id).filter(Boolean),
                starredRestaurantsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {
            console.log("error updating starred restaurants:", e);
        }
    };

    const handleFinishSeeingResults = () => {
        setResultVisible(false);
        navigation.navigate("Home");
        setResult(undefined);
    }

    // renders restaurants for flatlist
    const renderItem = ({item}) => (
        <ResultItem
            item={item}
            starred={starredIds.has(item.id)}
            onToggleStar={handleToggleStar}
        />
    );

    return (
        <Modal visible={resultVisible} transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.prefContainer}>
                    <View style={styles.headerContainer}>
                        <LargeText center="center" color="#5DB075" style={{marginTop: 30}}>
                            Results
                        </LargeText>
                        <SmallText size={13} center style={{ lineHeight: 20, marginTop: 10, paddingHorizontal: 20}}>
                            Star the places that are your favorite to save under your profile!
                        </SmallText>
                    </View>
                    <View style={styles.flatListContainer}>
                        <FlatList
                            data={userResults}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={true}
                            indicatorStyle="black"
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        />
                    </View>
                    <View style={styles.footerContainer}>
                        <Button
                            onPress={handleFinishSeeingResults}
                            paddingVertical={12}
                            paddingHorizontal={120}
                            fontSize={13}
                        >
                            Finish
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    image:{
        height: 55,
        width: 55,
        borderRadius: 10,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    prefContainer: {
        display: 'flex',
        backgroundColor: "#F7F7F7",
        top: 20,
        borderRadius: 20,
        height: 660,
        width: 310,
    },
    headerContainer: {
        backgroundColor: "#FFFFFF",
        width: 310,
        height: 140,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    flatListContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    footerContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection:'row',
        alignItems: 'center',
        width: 260,
        minHeight: 80,
        borderRadius: 10,
        padding: 10,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    ratingAndPriceContainer:{
        display:'flex',
        flexDirection:'row',
    },
    textContainer:{
        paddingLeft: 10,
    },
    iconColumn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    }
});

export default Results