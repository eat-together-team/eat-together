import { createContext } from "react";

// Bumps every time navigation state changes so the tutorial modal can
// present again on top of the screen that was just opened.
export const NavigationEpochContext = createContext(0);
