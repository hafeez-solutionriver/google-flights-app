import React from "react";
import { Text, StyleSheet } from "react-native";

export default function AppText({ children, bold, style }) {
  return (
    <Text
      style={[
        styles.baseText,
        bold ? styles.boldText : styles.regularText,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  baseText: {
    color: "#222",
    fontSize: 16,
  },
  regularText: {
    fontFamily: "Poppins-Regular",
  },
  boldText: {
    fontFamily: "Poppins-Bold",
  },
});
