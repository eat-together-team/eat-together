import React, { useEffect, useMemo, useState } from "react";
import {View, StyleSheet} from "react-native";
import InformationCard from "../../components/InformationCard";
import CompactRestaurantCard from "../../components/CompactRestaurantCard";
import LargeButton from "../../components/LargeButton";
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

const Results = ({userResults, setResult}) => {
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
        navigation.navigate("Explore");
        setResult(undefined);
    }

    return (
        <View style={styles.container}>
          <View style={styles.content}>
            <InformationCard text="Star the places that are your favorite to save under your profile!" />
            <View style={styles.list}>
                {(userResults || []).map((item) => (
                    <CompactRestaurantCard
                        key={item.id}
                        restaurant={item}
                        starred={starredIds.has(normalizeRestaurantId(item.id))}
                        onToggleStar={handleToggleStar}
                    />
                ))}
            </View>
          </View>
          <LargeButton onPress={handleFinishSeeingResults}>Finish</LargeButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: 340,
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 30,
    },
    content: {
        gap: 20,
    },
    list: {
        gap: 10,
    },
});

export default Results
