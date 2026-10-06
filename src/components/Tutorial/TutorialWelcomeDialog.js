import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import Dialog from "../Dialog";
import DialogOverlay from "../DialogOverlay";
import SubBodyText from "../typography/SubBodyText";

const TutorialWelcomeDialog = ({ visible, onBeginTour, onSkip }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <DialogOverlay visible={visible} onDismiss={onSkip}>
      <Dialog
        type="Informative"
        title="Welcome to Eat Together"
        icon={<Ionicons name="restaurant-outline" size={40} color={colors.onBackground} />}
        primaryButtonText="Begin tour"
        secondaryButtonText="No thanks"
        onPrimaryPress={onBeginTour}
        onSecondaryPress={onSkip}
      >
        <SubBodyText color={colors.onBackground} center>
          We’re really happy to have you here!{"\n"}Would you like to take a quick tour around the app?
        </SubBodyText>
      </Dialog>
    </DialogOverlay>
  );
};

export default TutorialWelcomeDialog;
