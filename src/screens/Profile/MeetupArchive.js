import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RBSheet from "react-native-raw-bottom-sheet";

import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import SmallText from "../../components/SmallText";
import EmptyState from "../../components/EmptyState";
import Filter from "../../components/Filter";
import HorizontalRow from "../../components/HorizontalRow";
import Link from "../../components/Link";
import getDate from "../../utils/getDate";

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 2.7 * 5 * numColumns) / numColumns;

function getEventTime(event) {
  const d = event.startDate?.toDate?.() ?? event.date?.toDate?.();
  return d ? d.getTime() : 0;
}

export default function MeetupArchive({ route, navigation }) {
  const events = route.params?.events || [];
  const isOwnProfile = route.params?.isOwnProfile === true;
  const profileName = route.params?.profileName || "";
  const title = isOwnProfile
    ? "My Meetup Archive"
    : profileName
    ? `${profileName}'s Meetup Archive`
    : "Meetup Archive";

  const [grid, setGrid] = useState(true);
  const [list, setList] = useState(false);
  const [newest, setNewest] = useState(true);
  const [oldest, setOldest] = useState(false);
  const showViewFilterRef = useRef();
  const showRecentFilterRef = useRef();

  const sortedEvents = useMemo(() => {
    const list = [...events];
    if (newest) return list.sort((a, b) => getEventTime(b) - getEventTime(a));
    if (oldest) return list.sort((a, b) => getEventTime(a) - getEventTime(b));
    return list;
  }, [events, newest, oldest]);

  const renderEvent = ({ item: event }) => {
    const eventDate = event.startDate
      ? event.startDate.toDate()
      : event.date
      ? event.date.toDate()
      : null;
    const formattedDate = eventDate ? getDate(eventDate, true) : "";

    return (
      <TouchableOpacity
        style={styles.eventContainer}
        onPress={() => navigation.navigate("FullCard", { event })}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={
            event.hasImage && event.image
              ? { uri: event.image }
              : require("../../../assets/foodBackground.png")
          }
          style={[styles.image, { width: tileSize, height: tileSize }]}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(0, 0, 0, 0.3)",
              "rgba(0, 0, 0, 0.85)",
            ]}
            locations={[0, 0.5, 1]}
            style={styles.gradientOverlay}
          />
          <View style={styles.textOverlay}>
            <NormalText style={styles.title} numberOfLines={2} color="white">
              {event.name || "Event"}
            </NormalText>
            {formattedDate && (
              <SmallText style={styles.date} color="white" numberOfLines={1}>
                {formattedDate}
              </SmallText>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderEventList = ({ item: event }) => {
    const eventDate = event.startDate?.toDate?.() ?? event.date?.toDate?.() ?? null;
    const formattedDate = eventDate ? getDate(eventDate, true) : "";
    const listCardWidth = screenWidth - 24;
    const listCardHeight = 180;

    return (
      <View style={styles.listItem}>
        <MediumText style={styles.listDate}>{formattedDate}</MediumText>
        <TouchableOpacity
          onPress={() => navigation.navigate("FullCard", { event })}
          activeOpacity={0.8}
          style={styles.listCardTouch}
        >
          <ImageBackground
            source={
              event.hasImage && event.image
                ? { uri: event.image }
                : require("../../../assets/foodBackground.png")
            }
            style={[styles.listCardImage, { width: listCardWidth, height: listCardHeight }]}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.85)"]}
              locations={[0, 0.5, 1]}
              style={styles.gradientOverlay}
            />
            <View style={styles.textOverlay}>
              <NormalText style={styles.title} numberOfLines={2} color="white">
                {event.name || "Event"}
              </NormalText>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText>{title}</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />
      {sortedEvents.length > 0 && (
        <View style={styles.filterRow}>
          <HorizontalRow style={{ paddingHorizontal: 20 }}>
            <Filter
              checked={grid || list}
              onPress={() => showViewFilterRef.current?.open()}
              text={grid ? "Grid View" : list ? "List View" : "   View   "}
            />
            <RBSheet
              height={150}
              ref={showViewFilterRef}
              closeOnDragDown
              closeOnPressMask={false}
              customStyles={{
                wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
                draggableIcon: { backgroundColor: "black" },
                container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10 },
              }}
            >
              <Filter
                checked={grid}
                text="Grid View"
                marginBottom={5}
                onPress={() => {
                  setGrid(true);
                  setList(false);
                  showViewFilterRef.current?.close();
                }}
              />
              <Filter
                checked={list}
                text="List View"
                marginBottom={5}
                onPress={() => {
                  setList(true);
                  setGrid(false);
                  showViewFilterRef.current?.close();
                }}
              />
              <Link onPress={() => showViewFilterRef.current?.close()}>Close</Link>
            </RBSheet>

            <Filter
              checked={newest || oldest}
              onPress={() => showRecentFilterRef.current?.open()}
              text={
                newest ? "Sort By Most Recent" : oldest ? "Sort By Least Recent" : "   Recency   "
              }
            />
            <RBSheet
              height={150}
              ref={showRecentFilterRef}
              closeOnDragDown
              closeOnPressMask={false}
              customStyles={{
                wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
                draggableIcon: { backgroundColor: "black" },
                container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 5 },
              }}
            >
              <Filter
                checked={oldest}
                text="Sort By Least Recent"
                marginBottom={5}
                onPress={() => {
                  setOldest(true);
                  setNewest(false);
                  showRecentFilterRef.current?.close();
                }}
              />
              <Filter
                checked={newest}
                text="Sort By Most Recent"
                marginBottom={5}
                onPress={() => {
                  setNewest(true);
                  setOldest(false);
                  showRecentFilterRef.current?.close();
                }}
              />
              <Link onPress={() => showRecentFilterRef.current?.close()}>Close</Link>
            </RBSheet>
          </HorizontalRow>
        </View>
      )}
      <View style={styles.container}>
        {sortedEvents.length > 0 ? (
          <FlatList
            data={sortedEvents}
            renderItem={grid ? renderEvent : renderEventList}
            numColumns={grid ? numColumns : 1}
            key={grid ? "grid" : "list"}
            keyExtractor={(item, index) => item.id || `event-${index}`}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <EmptyState
            title="No meetups yet"
            text="Your past meetups will appear here."
          />
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  filterRow: {
    marginBottom: 4,
  },

  flatListContent: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    justifyContent: "flex-start",
  },

  listItem: {
    marginVertical: 8,
    paddingHorizontal: 5,
  },

  listDate: {
    marginBottom: 6,
  },

  listCardTouch: {
    borderRadius: 10,
    overflow: "hidden",
  },

  listCardImage: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  eventContainer: {
    margin: 5,
    width: tileSize,
    alignItems: "center",
  },

  image: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  imageStyle: {
    borderRadius: 10,
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingBottom: 6,
  },

  title: {
    textAlign: "left",
    width: "100%",
    fontSize: 13,
  },
  
  date: {
    marginTop: 2,
    textAlign: "left",
    width: "100%",
  },
});
