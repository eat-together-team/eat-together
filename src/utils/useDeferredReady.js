import { useEffect, useState } from "react";

// Delays becoming "ready" until the JS thread is idle — screens that kick off
// heavy work (Firestore listeners, big list renders) as soon as they mount
// compete with the transition's own JS-thread work, which is what makes the
// animation itself look janky. Gate that work behind this instead of starting
// it on mount.
export default function useDeferredReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback(() => {
      setReady(true);
    });
    return () => cancelIdleCallback(id);
  }, []);

  return ready;
}
