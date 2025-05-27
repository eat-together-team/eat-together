import { Image, Text, View, StyleSheet, TouchableOpacity, Linking, ScrollView } from "react-native";

//Presents each restaurant result from YELP API Response
const RestaurantRec = ({ expanded, setExpanded, restaurant }) => {
    const hours = [
        { day: 'Mon', time: '11:00 AM - 11:00 PM' },
        { day: 'Tues', time: '11:00 AM - 11:00 PM' },
        { day: 'Wed', time: '11:00 AM - 11:00 PM' },
        { day: 'Thu', time: '11:00 AM - 11:00 PM' },
        { day: 'Fri', time: '11:00 AM - 12:00 AM' },
        { day: 'Sat', time: '10:00 AM - 12:00 AM' },
        { day: 'Sun', time: '11:00 AM - 11:00 PM' },
    ];

    return (
        <View>
            <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.expandArrow}>↔</Text>
            </TouchableOpacity>
            <Image
                source={{ uri: restaurant.imageUrl }}
                style={styles.image}
            />
            <Text style={styles.title}>{restaurant.name}</Text>
            <Text style={[styles.description, styles.centerText]}>
                A healthy, plant-based restaurant with a focus on fresh, locally sourced ingredients.
            </Text>
            <View style={styles.row}>
                <View style={styles.leftColumn}>
                    <Text style={styles.rowText}>American</Text>
                    <Text style={styles.ratingText}>{restaurant.price}  {restaurant.rating} ★</Text>
                </View>
                <Text style={styles.rowTextRight}>{restaurant.categories}</Text>
            </View>
            {expanded && (
                <View style={styles.extraInfo}>
                    <Text style={[styles.extraTitle, styles.centerText]}>Location & Hours</Text>
                    <Text
                        style={[styles.description, styles.centerText, {textDecorationLine: 'underline' }]}
                        onPress={() => Linking.openURL('https://maps.google.com/?q=2634+NE+University+Village+St,+Seattle,+WA+98105')}
                    >
                        {restaurant.address}
                    </Text>
                    <View style={styles.timetable}>
                        {hours.map(({ day, time }) => (
                            <View style={styles.timeRow} key={day}>
                                <Text style={styles.timeDay}>{day}</Text>
                                <Text style={styles.timeHours}>{time}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 311,
        height: 290,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    title: {
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: 30,
        color: '#5DB075',
        textAlign: 'left',
        padding: 20,
    },
    description: {
        paddingHorizontal: 20,
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 13,
        color: '#000000',
    },
    centerText: {
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 20,
        paddingLeft: 10,
    },
    leftColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: 13,
    },
    rowText: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 13,
        color: '#000',
        textAlign: 'left',
    },
    ratingText: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 13,
        color: '#000',
        marginTop: 2,
    },
    rowTextRight: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 13,
        color: '#000',
        flex: 1,
        textAlign: 'right',
        paddingRight: 20,
    },
    expandButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    expandArrow: {
        color: '#5DB075',
        fontSize: 22,
        fontWeight: 'bold',
    },
    extraInfo: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    extraTitle: {
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: 24,
        color: '#5DB075',
        marginBottom: 8,
    },
    timetable: {
        marginTop: 10,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 2,
    },
    timeDay: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 16,
        color: '#000',
        width: 60,
    },
    timeHours: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 16,
        color: '#000',
        textAlign: 'right',
        flex: 1,
    },
});

export default RestaurantRec