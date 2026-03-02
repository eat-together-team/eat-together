import React, { useState } from "react";
import {View, Modal, StyleSheet, FlatList, Image, TouchableOpacity} from "react-native";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import SmallText from "../../components/SmallText";
import Button from "../../components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const ResultItem = ({ item }) => {
    const [starred, setStarred] = useState(false);
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
                    <TouchableOpacity onPress={() => setStarred(prev => !prev)}>
                        <Ionicons
                            name={starred ? "star" : "star-outline"}
                            size={22}
                            color={starred ? "#F5C542" : undefined}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 8 }}>
                        <Ionicons name="arrow-redo-outline" size={20} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const Results = ({userResults, resultVisible, setResultVisible, setResult}) => {
    // redirect to profile page
    const navigation = useNavigation();

    const handleFinishSeeingResults = () => {
        setResultVisible(false);
        navigation.navigate("Home");
        setResult(undefined);
    }

    // renders restaurants for flatlist
    const renderItem = ({item}) => (
        <ResultItem item={item} />
    );

    return (
        <Modal visible={resultVisible} transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.prefContainer}>
                    <View style={styles.headerContainer}>
                        <LargeText center="center" color="#5DB075" style={{marginTop: 30}}>
                            Results
                        </LargeText>
                        <SmallText size={13} center style={{ lineHeight: 20, marginTop: 10, paddingHorizontal: 20 }}>
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