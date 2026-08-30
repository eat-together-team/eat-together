// Drives the guided-tour tutorial shown to a user on their first visit to
// Explore (or replayed from Settings > Launch tutorial). Owns the current
// phase/step and a registry of on-screen target refs (bell icon, tab bar
// buttons) that TutorialStepsOverlay measures to position its spotlight.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "./Firebase";

const TUTORIAL_STEPS = [
  {
    key: "notifications",
    anchor: "top",
    shape: "circle",
    title: "Notifications",
    body: "Here, you’ll find updates about events, friends, exchanges, messages and more. You can customize notifications in Settings.",
  },
  {
    key: "newEvent",
    anchor: "bottom",
    shape: "roundedRect",
    title: "New Event",
    body: "Use this button to create your own Eat Together meetups. Choose a place and time, post the event, and we’ll do the rest!",
  },
  {
    key: "Explore",
    anchor: "bottom",
    shape: "roundedRect",
    title: "Explore",
    body: "This is your one-stop-shop for everything Eat Together! Find new friends, events and more on this page",
  },
  {
    key: "Notifs",
    anchor: "bottom",
    shape: "roundedRect",
    title: "Inbox",
    body: "Here, you’ll find all your messages, group chats, and dining dollar exchange chats",
  },
  {
    key: "Profile",
    anchor: "bottom",
    shape: "roundedRect",
    title: "Account",
    body: "This is where you can view your profile, customize it, and access Settings.",
  },
];

// Generous upper bound on any real target's size (largest is the ~102x47
// "+ Event" pill) — used to reject implausible/transient measurements. Kept
// loose since a false rejection here only costs the spotlight ring for that
// step (TutorialStepsOverlay always shows the card/Back/Next regardless).
const MAX_TARGET_SIZE = 200;

const noop = () => {};
const TutorialContext = createContext({
  phase: "hidden",
  stepIndex: 0,
  displayedStepIndex: null,
  setDisplayedStepIndex: noop,
  activeTargetKey: null,
  startTutorial: noop,
  beginTour: noop,
  skipTutorial: noop,
  nextStep: noop,
  prevStep: noop,
  finishTutorial: noop,
  registerTarget: () => noop,
  measureTarget: () => Promise.resolve(null),
});

const TutorialProvider = ({ children }) => {
  // 'hidden' | 'intro' | 'steps' | 'outro'
  const [phase, setPhase] = useState("hidden");
  const [stepIndex, setStepIndex] = useState(0);
  // The step TutorialStepsOverlay is actually showing right now, reported
  // back via setDisplayedStepIndex — distinct from `stepIndex` (the step
  // being transitioned *to*) so activeTargetKey (and anything highlighting
  // off it, like the tab bar) doesn't jump ahead of the card/spotlight
  // while a step transition's fade-out is still playing.
  const [displayedStepIndex, setDisplayedStepIndex] = useState(null);
  const targetsRef = useRef({});

  const markSeen = useCallback(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    db.collection("Users").doc(uid).update({ "settings.hasSeenTutorial": true }).catch(() => {});
  }, []);

  const startTutorial = useCallback(() => {
    setStepIndex(0);
    setPhase("intro");
  }, []);

  const beginTour = useCallback(() => {
    setStepIndex(0);
    setPhase("steps");
  }, []);

  const skipTutorial = useCallback(() => {
    setPhase("hidden");
    markSeen();
  }, [markSeen]);

  const nextStep = useCallback(() => {
    setStepIndex((current) => {
      if (current + 1 >= TUTORIAL_STEPS.length) {
        setPhase("outro");
        return current;
      }
      return current + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const finishTutorial = useCallback(() => {
    setPhase("hidden");
    markSeen();
  }, [markSeen]);

  const registerTarget = useCallback((key, ref) => {
    targetsRef.current[key] = ref;
    return () => {
      if (targetsRef.current[key] === ref) {
        delete targetsRef.current[key];
      }
    };
  }, []);

  const measureTarget = useCallback((key) => (
    new Promise((resolve) => {
      const ref = targetsRef.current[key];
      if (!ref?.current?.measure) {
        resolve(null);
        return;
      }
      // .measure()'s pageX/pageY (rather than measureInWindow) is the
      // standard way to get a target's absolute on-screen position for a
      // coachmark/spotlight overlay — measureInWindow has known reliability
      // issues in exactly this kind of nested-Modal-over-a-navigator setup.
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        // None of the 5 tutorial targets (icons/pills/tab items) are ever
        // anywhere near this big — a reading this large means the native
        // measure call landed on a mid-layout/transient frame rather than
        // the target's real one, so treat it as not-ready and let the
        // caller's retry loop try again instead of spotlighting garbage.
        const isPlausible = width > 0 && height > 0 && width < MAX_TARGET_SIZE && height < MAX_TARGET_SIZE;
        resolve(isPlausible ? { x: pageX, y: pageY, width, height } : null);
      });
    })
  ), []);

  const activeTargetKey = phase === "steps" && displayedStepIndex !== null
    ? TUTORIAL_STEPS[displayedStepIndex].key
    : null;

  const value = useMemo(() => ({
    phase,
    stepIndex,
    displayedStepIndex,
    setDisplayedStepIndex,
    activeTargetKey,
    startTutorial,
    beginTour,
    skipTutorial,
    nextStep,
    prevStep,
    finishTutorial,
    registerTarget,
    measureTarget,
  }), [
    phase,
    stepIndex,
    displayedStepIndex,
    activeTargetKey,
    startTutorial,
    beginTour,
    skipTutorial,
    nextStep,
    prevStep,
    finishTutorial,
    registerTarget,
    measureTarget,
  ]);

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};

const useTutorial = () => useContext(TutorialContext);

// Attach the returned ref to a target element (it must support .measure(),
// e.g. a View/Pressable) to make it highlightable by `key`.
const useTutorialTarget = (key) => {
  const { registerTarget } = useTutorial();
  const ref = useRef(null);

  useEffect(() => registerTarget(key, ref), [key, registerTarget]);

  return ref;
};

export { TutorialContext, TutorialProvider, useTutorial, useTutorialTarget, TUTORIAL_STEPS };
