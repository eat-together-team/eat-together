// Renders the spotlight + card for the current step.
//
// The card is shown immediately from stepIndex. An opacity fade here used to
// stick at 0 when the native animation was cancelled, which made the whole
// step — including Back/Next — disappear.
//
// The spotlight holes are visual only. Taps there do nothing — those
// controls don't open a new part of the tour. Next and Back on the card
// are the only way forward.

import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useTutorial, TUTORIAL_STEPS } from "../../provider/TutorialProvider";
import TutorialSpotlight from "./TutorialSpotlight";
import TutorialCard from "./TutorialCard";

const MAX_MEASURE_ATTEMPTS = 10;
const MEASURE_RETRY_DELAY = 150;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TutorialStepsOverlay = () => {
  const {
    stepIndex,
    nextStep,
    prevStep,
    measureTarget,
    setDisplayedStepIndex,
  } = useTutorial();
  const [target, setTarget] = useState(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const step = TUTORIAL_STEPS[stepIndex];

  useEffect(() => {
    setDisplayedStepIndex(stepIndex);
  }, [stepIndex, setDisplayedStepIndex]);

  useEffect(() => {
    let cancelled = false;
    setTarget(null);

    (async () => {
      for (let attempt = 0; attempt < MAX_MEASURE_ATTEMPTS && !cancelled; attempt++) {
        const rect = await measureTarget(step.key);
        if (cancelled) return;
        if (rect) {
          setTarget(rect);
          return;
        }
        await delay(MEASURE_RETRY_DELAY);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stepIndex, step.key, measureTarget]);

  return (
    <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
      <View pointerEvents="none" style={styles.fill}>
        <TutorialSpotlight target={target} shape={step.shape} />
      </View>
      <View pointerEvents="box-none" style={styles.fill}>
        <TutorialCard
          anchor={step.anchor}
          target={target}
          title={step.title}
          body={step.body}
          stepIndex={stepIndex}
          stepCount={TUTORIAL_STEPS.length}
          onBack={stepIndex > 0 ? prevStep : null}
          onNext={nextStep}
        />
      </View>
    </View>
  );
};

export default TutorialStepsOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
