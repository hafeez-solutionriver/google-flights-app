import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../components/AppText";

export default function SearchFlightsScreen() {
  return (
    <View style={styles.container}>
      <AppText bold>Flight Search Screen</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
