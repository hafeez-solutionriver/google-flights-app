import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../components/AppText";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <AppText bold style={{ fontSize: 22 }}>Welcome to Google Flights App</AppText>
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
});
