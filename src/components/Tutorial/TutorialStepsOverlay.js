// Renders the spotlight + card for the current step, cross-fading between
// steps rather than jump-cutting.
//
// The card (with working Back/Next) always appears right away, regardless
// of whether the target's on-screen position could be measured — it must
// never be the thing blocking the user from moving forward or back.
// Precisely spotlighting the real target is treated as a best-effort
// enhancement: measurement keeps retrying in the background and, if/when
// it succeeds, the ring appears and the card slides to hug the target.

import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTutorial, TUTORIAL_STEPS } from "../../provider/TutorialProvider";
import TutorialSpotlight from "./TutorialSpotlight";
import TutorialCard from "./TutorialCard";

const MAX_MEASURE_ATTEMPTS = 10;
const MEASURE_RETRY_DELAY = 150;
const FADE_DURATION = 200;
const CARD_SLIDE_DISTANCE = 12;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TutorialStepsOverlay = () => {
  const {
    stepIndex,
    nextStep,
    prevStep,
    measureTarget,
    displayedStepIndex,
    setDisplayedStepIndex,
  } = useTutorial();
  const [target, setTarget] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const step = displayedStepIndex !== null ? TUTORIAL_STEPS[displayedStepIndex] : null;

  useEffect(() => {
    let cancelled = false;

    const animateTo = (toValue) => new Promise((resolve) => {
      Animated.timing(progress, {
        toValue,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(resolve);
    });

    async function run() {
      setIsTransitioning(true);

      // Fade the previous step out before swapping content — skipped on
      // the very first step, since nothing is showing yet. `displayedStepIndex`
      // here is the value from the render that scheduled this effect run,
      // i.e. whatever step is still actually on screen right now.
      if (displayedStepIndex !== null) {
        await animateTo(0);
      }
      if (cancelled) return;

      // Show the card immediately at its fallback position — do not wait
      // on measurement for this. `target` starts null on purpose so
      // TutorialCard renders untargeted right away.
      setTarget(null);
      setDisplayedStepIndex(stepIndex);

      // Start measuring the real target in the background *while* the fade
      // in plays, rather than after — the target is almost always already
      // laid out (it's been on screen the whole time), so this usually
      // resolves within the fade and the card lands precisely positioned
      // from the start instead of visibly snapping into place afterward.
      const targetKey = TUTORIAL_STEPS[stepIndex].key;
      (async () => {
        for (let attempt = 0; attempt < MAX_MEASURE_ATTEMPTS && !cancelled; attempt++) {
          const rect = await measureTarget(targetKey);
          if (cancelled) return;
          if (rect) {
            setTarget(rect);
            return;
          }
          await delay(MEASURE_RETRY_DELAY);
        }
      })();

      await animateTo(1);
      if (!cancelled) setIsTransitioning(false);
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, measureTarget, setDisplayedStepIndex]);

  const cardTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD_SLIDE_DISTANCE, 0],
  });

  if (!step) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Animated.View pointerEvents="none" style={[styles.fill, { opacity: progress }]}>
        <TutorialSpotlight target={target} shape={step.shape} />
      </Animated.View>
      <Animated.View
        pointerEvents={isTransitioning ? "none" : "auto"}
        style={[styles.fill, { opacity: progress, transform: [{ translateY: cardTranslateY }] }]}
      >
        <TutorialCard
          anchor={step.anchor}
          target={target}
          title={step.title}
          body={step.body}
          stepIndex={displayedStepIndex}
          stepCount={TUTORIAL_STEPS.length}
          onBack={displayedStepIndex > 0 ? prevStep : null}
          onNext={nextStep}
        />
      </Animated.View>
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
