// Full-screen scrim with a hole cut around the current tutorial target, so
// only that button/icon stays undimmed, ringed in the theme's highlight
// color — the "green box with a hole" the target is spotlighted through.

import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { getScrimColor } from "../Scrim";

const HOLE_PADDING = 8;
const RING_WIDTH = 3;
const RECT_HOLE_RADIUS = 16;

function roundedRectPath(x, y, w, h, r) {
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
}

function circlePath(cx, cy, r) {
  return `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
}

const TutorialSpotlight = ({ target, shape }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  if (!target) return null;

  const scrimColor = getScrimColor(theme);
  const ringColor = theme === "dark" ? colors.onPrimaryContainer : colors.onPrimary;
  const outerPath = `M0,0 H${screenWidth} V${screenHeight} H0 Z`;

  let holePath;
  let ring;
  if (shape === "circle") {
    const r = Math.max(target.width, target.height) / 2 + HOLE_PADDING;
    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    holePath = circlePath(cx, cy, r);
    ring = <Circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={RING_WIDTH} />;
  } else {
    const x = target.x - HOLE_PADDING;
    const y = target.y - HOLE_PADDING;
    const w = target.width + HOLE_PADDING * 2;
    const h = target.height + HOLE_PADDING * 2;
    holePath = roundedRectPath(x, y, w, h, RECT_HOLE_RADIUS);
    ring = (
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={RECT_HOLE_RADIUS}
        fill="none"
        stroke={ringColor}
        strokeWidth={RING_WIDTH}
      />
    );
  }

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={screenWidth}
      height={screenHeight}
    >
      <Path d={`${outerPath} ${holePath}`} fill={scrimColor} fillRule="evenodd" />
      {ring}
    </Svg>
  );
};

export default TutorialSpotlight;
