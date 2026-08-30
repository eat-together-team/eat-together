// Root of the tutorial UI — mounted once above the logged-in app so it can
// sit on top of every screen. Switches on the current phase from
// TutorialProvider: an intro dialog, the 5-step guided spotlight tour, then
// an outro dialog.

import React from "react";
import { Modal } from "react-native";
import { useTutorial } from "../../provider/TutorialProvider";
import TutorialWelcomeDialog from "./TutorialWelcomeDialog";
import TutorialCompleteDialog from "./TutorialCompleteDialog";
import TutorialStepsOverlay from "./TutorialStepsOverlay";

const TutorialOverlay = () => {
  const { phase, beginTour, skipTutorial, finishTutorial } = useTutorial();

  return (
    <>
      <TutorialWelcomeDialog visible={phase === "intro"} onBeginTour={beginTour} onSkip={skipTutorial} />
      <TutorialCompleteDialog visible={phase === "outro"} onDone={finishTutorial} />
      <Modal visible={phase === "steps"} transparent animationType="fade">
        <TutorialStepsOverlay />
      </Modal>
    </>
  );
};

export default TutorialOverlay;
