import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../components/AppText";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <AppText bold>Signup Screen</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
