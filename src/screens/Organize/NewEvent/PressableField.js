// Wraps a read-only-looking field (built from a real input component, e.g.
// TextInputField) so tapping anywhere on it opens a picker instead of the
// keyboard — the child's own touch/focus handling is disabled via
// pointerEvents="none" so only this wrapper's onPress fires.

import React from "react";
import { TouchableOpacity, View } from "react-native";

const PressableField = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View pointerEvents="none">{children}</View>
  </TouchableOpacity>
);

export default PressableField;
