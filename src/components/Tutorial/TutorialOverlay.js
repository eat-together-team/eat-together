// Root of the tutorial UI — mounted once above the logged-in app so it can
// sit on top of every screen. Switches on the current phase from
// TutorialProvider: an intro dialog, the 5-step guided spotlight tour, then
// an outro dialog. The steps tour is a modal so the instruction card stays
// above screens the tour opens, like the new-event screen.

import React, { useContext } from "react";
import { Modal, useWindowDimensions, View } from "react-native";
import { NavigationEpochContext } from "../../navigation/NavigationEpoch";
import { useTutorial } from "../../provider/TutorialProvider";
import TutorialWelcomeDialog from "./TutorialWelcomeDialog";
import TutorialCompleteDialog from "./TutorialCompleteDialog";
import TutorialStepsOverlay from "./TutorialStepsOverlay";

const TutorialOverlay = () => {
  const { phase, beginTour, skipTutorial, finishTutorial } = useTutorial();
  const navigationEpoch = useContext(NavigationEpochContext);
  const { width, height } = useWindowDimensions();

  return (
    <>
      <TutorialWelcomeDialog visible={phase === "intro"} onBeginTour={beginTour} onSkip={skipTutorial} />
      <TutorialCompleteDialog visible={phase === "outro"} onDone={finishTutorial} />
      {/* Remount when the route changes so the modal is presented again from
          the screen that was just pushed. Otherwise the new-event screen
          covers the card. */}
      {phase === "steps" && (
        <Modal
          key={navigationEpoch}
          visible
          transparent
          statusBarTranslucent
          presentationStyle="overFullScreen"
          animationType="fade"
          onRequestClose={skipTutorial}
        >
          <View style={{ width, height }}>
            <TutorialStepsOverlay />
          </View>
        </Modal>
      )}
    </>
  );
};

export default TutorialOverlay;
