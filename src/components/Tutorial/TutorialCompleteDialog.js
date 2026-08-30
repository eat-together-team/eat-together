import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import Dialog from "../Dialog";
import DialogOverlay from "../DialogOverlay";
import SubBodyText from "../typography/SubBodyText";

const TutorialCompleteDialog = ({ visible, onDone }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <DialogOverlay visible={visible} onDismiss={onDone}>
      <Dialog
        type="Informative"
        title="Tutorial complete"
        icon={<Ionicons name="checkmark" size={40} color={colors.onBackground} />}
        primaryButtonText="Done"
        onPrimaryPress={onDone}
      >
        <SubBodyText color={colors.onBackground} center>
          Thanks for completing the tour! You can always access this again in settings
        </SubBodyText>
      </Dialog>
    </DialogOverlay>
  );
};

export default TutorialCompleteDialog;
