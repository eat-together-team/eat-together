import React from "react";
import { Text, Platform } from "react-native";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import Dialog from "../Dialog";
import DialogOverlay from "../DialogOverlay";

// One-time explainer shown the first time a user opens the Dining Dollar
// Exchange (tracked by `settings.hasSeenDiningDollarsWelcome`, same pattern as
// RecommendationInfoDialog).
const DollarsWelcomeDialog = ({ visible, onEnter }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  const fontRegular = fontsLoaded ? "Inter_400Regular" : Platform.OS === "ios" ? "AppleSDGothicNeo-Regular" : "sans-serif";
  const fontBold = fontsLoaded ? "Inter_700Bold" : Platform.OS === "ios" ? "AppleSDGothicNeo-Bold" : "sans-serif-bold";
  const baseStyle = { fontSize: 12, fontFamily: fontRegular, color: colors.onBackground, textAlign: "center" };
  const boldStyle = { fontFamily: fontBold };

  return (
    <DialogOverlay visible={visible} onDismiss={onEnter}>
      <Dialog
        type="Informative"
        title="Dining Dollar Exchange"
        icon={<Ionicons name="cash-outline" size={40} color={colors.onBackground} />}
        primaryButtonText="Enter"
        onPrimaryPress={onEnter}
      >
        <Text style={baseStyle}>
          Have <Text style={boldStyle}>dining dollars</Text> you won’t use, or need a few more? Post an{" "}
          <Text style={boldStyle}>offer</Text> or a <Text style={boldStyle}>request</Text>, or claim someone
          else’s.{"\n\n"}
          Once a poster accepts, you’ll <Text style={boldStyle}>chat</Text> to pick a spot and payment method,
          then mark the exchange complete.{"\n\n"}
          <Text style={boldStyle}>Stay safe:</Text> chats aren’t moderated. Meet in public dining locations and
          never pay before you’ve received what you agreed on.
        </Text>
      </Dialog>
    </DialogOverlay>
  );
};

export default DollarsWelcomeDialog;
