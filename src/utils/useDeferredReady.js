import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

// Delays becoming "ready" until the current navigation transition (and any
// other queued interactions) has finished — screens that kick off heavy work
// (Firestore listeners, big list renders) as soon as they mount compete with
// the transition's own JS-thread work, which is what makes the animation
// itself look janky. Gate that work behind this instead of starting it on
// mount.
export default function useDeferredReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return ready;
}
