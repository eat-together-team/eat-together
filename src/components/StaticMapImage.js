// A small map preview with a pin, for an event's location — no API key.
//
// There's no working keyless "static map + marker" single-image API (the
// old staticmap.openstreetmap.de service this used to call doesn't even
// resolve anymore, and Wikimedia's map tiles explicitly forbid non-Wikimedia
// use), so this composes the preview itself from OpenStreetMap's raw tile
// server: fetch the 3x3 grid of tiles around the target point, position
// them so the point lands under a pin icon fixed at the container's center,
// and let the container's overflow:hidden crop it down to size.
//
// Prefers `lat`/`lng` already stored on the event (from the Yelp result it
// was picked from in step 2 of the create/edit flow); for older events that
// predate those fields, falls back to a one-time client geocode of the
// address via OSM's free Nominatim service. If neither a stored coordinate
// nor a geocode result is available, renders nothing.

import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";

const TILE_SIZE = 256;
const ZOOM = 15;
const GRID_TILES = 3; // odd, so there's always a true center tile
const CONTAINER_HEIGHT = 175;
// The container's actual width is "100%" of its parent, which this
// component can't measure up front — 420 comfortably covers every
// realistic phone width once the page's own horizontal padding is
// accounted for, so the 3x3 tile grid (768px) never runs out at the edges.
const ASSUMED_CONTAINER_WIDTH = 420;
const PIN_SIZE = 30;

// Standard Web Mercator slippy-map projection: lat/lon -> pixel position on
// the whole rendered world at this zoom level.
const project = (lat, lon) => {
  const scale = TILE_SIZE * Math.pow(2, ZOOM);
  const x = ((lon + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
};

const StaticMapImage = ({ lat, lng, address, style }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const hasStoredCoords = lat != null && lng != null;
  const [geocoded, setGeocoded] = useState(null);

  useEffect(() => {
    if (hasStoredCoords || !address) return;
    let cancelled = false;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`, {
      headers: { "User-Agent": "eat-together-app" },
    })
      .then((response) => response.json())
      .then((results) => {
        if (cancelled || !results?.[0]) return;
        setGeocoded({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hasStoredCoords, address]);

  const coords = hasStoredCoords ? { lat, lng } : geocoded;
  if (!coords) return null;

  const { x: worldX, y: worldY } = project(coords.lat, coords.lng);
  const centerTileX = Math.floor(worldX / TILE_SIZE);
  const centerTileY = Math.floor(worldY / TILE_SIZE);
  const gridOriginTileX = centerTileX - Math.floor(GRID_TILES / 2);
  const gridOriginTileY = centerTileY - Math.floor(GRID_TILES / 2);
  const gridSize = GRID_TILES * TILE_SIZE;

  // Target point's position within the tile grid, then where the grid's
  // top-left corner needs to sit so that point lands at the visible
  // container's center.
  const pointInGridX = worldX - gridOriginTileX * TILE_SIZE;
  const pointInGridY = worldY - gridOriginTileY * TILE_SIZE;
  const gridLeft = ASSUMED_CONTAINER_WIDTH / 2 - pointInGridX;
  const gridTop = CONTAINER_HEIGHT / 2 - pointInGridY;

  const tiles = [];
  for (let dx = 0; dx < GRID_TILES; dx++) {
    for (let dy = 0; dy < GRID_TILES; dy++) {
      const tileX = gridOriginTileX + dx;
      const tileY = gridOriginTileY + dy;
      tiles.push(
        <Image
          key={`${tileX}-${tileY}`}
          source={{
            uri: `https://tile.openstreetmap.org/${ZOOM}/${tileX}/${tileY}.png`,
            headers: { "User-Agent": "eat-together-app" },
          }}
          style={{ position: "absolute", left: dx * TILE_SIZE, top: dy * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
        />
      );
    }
  }

  return (
    <View style={[styles.container, { height: CONTAINER_HEIGHT, backgroundColor: tokens.containerMedium }, style]}>
      <View style={{ position: "absolute", left: gridLeft, top: gridTop, width: gridSize, height: gridSize }}>
        {tiles}
      </View>
      <View pointerEvents="none" style={styles.pinWrap}>
        <Ionicons name="location" size={PIN_SIZE} color={tokens.error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: radiusTokens.small,
    overflow: "hidden",
  },
  pinWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    // Centers the pin glyph's bottom tip (not its bounding-box center) on
    // the target point, matching how map pins are conventionally anchored.
    marginLeft: -PIN_SIZE / 2,
    marginTop: -PIN_SIZE,
  },
});

export default StaticMapImage;
