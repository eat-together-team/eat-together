import { Image, Dimensions } from "react-native";

const ImageContainer = (props) => {
  return (
    <Image
      style={{
        width: props.size ?? Dimensions.get("window").width - 50,
        height: props.size ?? Dimensions.get("window").height / 4,
        borderRadius: 15
      }}
      source={{uri: props.uri}}
    />
  );
};

export default ImageContainer;
