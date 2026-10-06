import React from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";
import SubBodyText from "./typography/SubBodyText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import getDate from "../utils/getDate";
import getTime from "../utils/getTime";

// A centered, timestamped activity-log row inline in the chat — "X left the
// chat", "X changed the chat icon", etc. Same two-line style already used
// for the pending-request footer in ChatRoom.js (main line + a lighter
// date/time line underneath).
const SystemMessage = ({ text, sentAt }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const date = moment.unix(sentAt).toDate();

  return (
    <View style={styles.container}>
      <SubBodyText color={tokens.textNormal} center>
        {text}
      </SubBodyText>
      <SubBodyText color={tokens.textLight} center style={styles.timestamp}>
        {getDate(date, false)} · {getTime(date)}
      </SubBodyText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  timestamp: {
    marginTop: 2,
  },
});

export default SystemMessage;
