import {View, Modal, StyleSheet, FlatList, Image} from "react-native";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import Button from "../../components/Button";
import star from "../../../assets/star.png";
import forward from "../../../assets/forward.png";
import { useNavigation } from '@react-navigation/native';

// Shows a list of restaurants user pressed "green" on 
const Results = ({userResults, resultVisible, setResultVisible}) => {
    // redirect to profile page
    const navigation = useNavigation();

    const handleFinishSeeingResults = () => {
        setResultVisible(false);
        navigation.navigate("Profile");
    }

    // Renders each restaurant as an item for Flatlist
    const renderItem = ({item}) => (
        <View style={styles.itemContainer}>
            <View style = {styles.imageContainer}>
                <Image         
                    source={{ uri: item.image }}
                    style={styles.image}
                />
            </View>
            <View style = {styles.textContainer}>
                <MediumText style = {{lineHeight: 13, paddingBottom: 5,}} size = {13}>{item?.name}</MediumText>
                <MediumText color = "#5DB075" size ={11} style ={{lineHeight: 12}}>
                    {item?.categoryAliases[0].charAt(0).toUpperCase() + item?.categoryAliases[0].substring(1)}
                </MediumText>
                <View style = {styles.ratingAndPriceContainer}>
                    <MediumText paddingHorizontal = {2} color = "#5DB075" size = {11}>
                        {item?.price}
                    </MediumText>
                    <MediumText color = "#5DB075" size = {11}>
                        {item?.rating}
                    </MediumText>
                </View>
            </View>
            <View style = {{position:'absolute', right: 5, top: 25}}>
                <Image source = {star} style = {{width: 17, height: 15}}/>
            </View>
            <View style = {{position:'absolute', right: 5, top: 50}}>
                <Image source = {forward} style = {{width: 17, height: 15}}/>
            </View>
        </View>
    );

    return (
        <Modal visible={resultVisible} transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.prefContainer}>
                    <View style={styles.headerContainer}>
                        <LargeText center="center" color="#5DB075" style={{marginTop: 30}}>
                            Results
                        </LargeText>
                        <MediumText size = {13} weight = "bold" center = {true} style = {{lineHeight: 20,}}>
                            Star the places that are your favorite to save under your profile
                        </MediumText>
                    </View>
                    <View style={styles.flatListContainer}>
                        <FlatList
                            data={userResults}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={true}
                            indicatorStyle="black"
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                    <View style = {{display:'flex', alignItems:'center', bottom: 20,}}>
                        <Button onPress={handleFinishSeeingResults} width = {100} fontSize = {15} paddingHorizontal = {20}>
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
        borderRadius: 40,
        height: 660,
        width: 310,
    },
    headerContainer: {
        backgroundColor: "#FFFFFF",
        width: 310,
        height: 140,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    flatListContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection:'row',
        width: 260,
        height: 80,
        borderRadius: 10,
        padding: 10,

    },
    ratingAndPriceContainer:{
        display:'flex',
        flexDirection:'row',
    },
    textContainer:{
        paddingLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 5,
    }
});

export default Results