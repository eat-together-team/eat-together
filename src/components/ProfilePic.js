import { Image } from "react-native";
const ProfilePic = (props) => {
  const bordered = props.bordered ?? true;
  const ringColor = props.ringColor ?? "#5DB075";
  return (
    <Image
      style={{
        backgroundColor: "#5DB075",
        borderWidth: bordered ? 2 : 0,
        borderColor: ringColor,
        width: props.size ?? 60,
        height: props.size ?? 60,
        borderRadius: 30,
      }}
      source={props.uri ? { uri: props.uri } : require("../../assets/big_logo.png")}
    />
  );
};

export default ProfilePic;
