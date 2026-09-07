// The design's fast-food glyph — not Ionicons' built-in "fast-food-outline"
// (that one's filled/reads wrong at small sizes; this is the actual
// outlined icon from Figma). Originally one-off in FullCard.js's Attend
// button; promoted here once a second place (the profile "My events"
// header icon) needed the same glyph.

import React from "react";
import Svg, { Path } from "react-native-svg";

const FastFoodIcon = ({ size = 16, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M10.0643 13.0029C10.0643 14.1079 9.41886 15.0034 8.31393 15.0034H4.18803C3.08311 15.0034 2.43765 14.1079 2.43765 13.0029"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M10.5017 10.502C11.054 10.502 11.5019 11.0618 11.5019 11.7522C11.5019 12.4427 11.054 13.0025 10.5017 13.0025H1.99981C1.4475 13.0025 0.999588 12.4427 0.999588 11.7522C0.999588 11.0618 1.4475 10.502 1.99981 10.502"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M10.7517 10.5023H5.60403C5.5378 10.5023 5.47429 10.5286 5.42743 10.5754L4.58881 11.414C4.5772 11.4257 4.56341 11.4349 4.54823 11.4412C4.53305 11.4475 4.51678 11.4507 4.50035 11.4507C4.48392 11.4507 4.46765 11.4475 4.45247 11.4412C4.4373 11.4349 4.42351 11.4257 4.41189 11.414L3.57327 10.5754C3.52642 10.5286 3.4629 10.5023 3.39667 10.5023H1.74975C1.5508 10.5023 1.35999 10.4232 1.21931 10.2826C1.07862 10.1419 0.999588 9.95107 0.999588 9.75212V9.75212C0.999588 9.55316 1.07862 9.36235 1.21931 9.22167C1.35999 9.08099 1.5508 9.00195 1.74975 9.00195H10.7517C10.9507 9.00195 11.1415 9.08099 11.2822 9.22167C11.4228 9.36235 11.5019 9.55316 11.5019 9.75212C11.5019 9.95107 11.4228 10.1419 11.2822 10.2826C11.1415 10.4232 10.9507 10.5023 10.7517 10.5023Z"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M2.00026 8.62655V8.61967C2.00026 6.90055 3.40682 6.00098 5.12594 6.00098H7.37643C9.09556 6.00098 10.5021 6.90742 10.5021 8.62655V8.61967"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M7.53258 3.50049L7.7653 5.50146"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M8.00131 15.003H12.3557C12.608 15.003 12.851 14.9076 13.036 14.736C13.221 14.5643 13.3343 14.3291 13.3531 14.0775L14.4715 3.50049"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M11.5021 3.50238L12.0025 1.50048L13.4727 1"
      stroke={color}
      strokeWidth={1.00189}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.00102 3.50049H15.0028"
      stroke={color}
      strokeWidth={1.00189}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </Svg>
);

export default FastFoodIcon;
