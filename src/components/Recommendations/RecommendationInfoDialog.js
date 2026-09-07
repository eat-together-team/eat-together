import React from "react";
import { Text, Platform } from "react-native";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import Dialog from "../Dialog";
import DialogOverlay from "../DialogOverlay";

// "What's this?" explainer for the recommendation feature — shown the first
// time a user opens a Recommendation, and any time after via the "What's
// this?" link on that screen's info card.
const RecommendationInfoDialog = ({ visible, onDismiss, onGoToSettings }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  const fontRegular = fontsLoaded ? "Inter_400Regular" : Platform.OS === "ios" ? "AppleSDGothicNeo-Regular" : "sans-serif";
  const fontBold = fontsLoaded ? "Inter_700Bold" : Platform.OS === "ios" ? "AppleSDGothicNeo-Bold" : "sans-serif-bold";
  const baseStyle = { fontSize: 12, fontFamily: fontRegular, color: colors.onBackground, textAlign: "center" };
  const boldStyle = { fontFamily: fontBold };

  return (
    <DialogOverlay visible={visible} onDismiss={onDismiss}>
      <Dialog
        type="Informative"
        title="Event recommendations"
        icon={<Ionicons name="sparkles" size={40} color={colors.onBackground} />}
        primaryButtonText="Got it!"
        secondaryButtonText="App settings"
        onPrimaryPress={onDismiss}
        onSecondaryPress={onGoToSettings}
      >
        <Text style={baseStyle}>
          Based on your app usage, Eat Together crafts <Text style={boldStyle}>curated</Text> event
          recommendations for you - these are <Text style={boldStyle}>suggested event configurations</Text> that
          we think you’ll like!{"\n\n"}
          If you like what you see, you can easily <Text style={boldStyle}>make an event</Text> out of what we
          {" "}<Text style={boldStyle}>suggest</Text> here, edit the details and invite your friends{"\n\n"}
          Please note that these recommendations <Text style={boldStyle}>aren’t real</Text> - unless you create
          an event out of it!{"\n\n"}
          You can turn this feature off in <Text style={boldStyle}>settings</Text>.
        </Text>
      </Dialog>
    </DialogOverlay>
  );
};

export default RecommendationInfoDialog;
