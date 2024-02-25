import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
    page: {
      alignItems: "center",
      width: Dimensions.get('screen').width,
      paddingHorizontal: 20,
      paddingVertical: 50
    },
  
    buttons: {
      marginTop: 50,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center"
    }
});

export default styles;
