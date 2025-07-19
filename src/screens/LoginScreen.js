import React, { useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import AppText from "../components/AppText";
import AppInput from "../components/AppInput";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleUserLogin = () => {
    login({ email: userEmail });
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <AppText bold style={styles.titleText}>
          Welcome Back
        </AppText>
        <AppText style={styles.subtitleText}>
          Login to continue your flight booking
        </AppText>
      </View>

      <View style={styles.formSection}>
        <AppInput
          placeholder="Enter your email"
          value={userEmail}
          onChangeText={setUserEmail}
        />
        <AppInput
          placeholder="Enter your password"
          secureTextEntry
          value={userPassword}
          onChangeText={setUserPassword}
        />

        <CustomButton title="Login" onPress={handleUserLogin} />

        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate("Signup")}
        >
          <AppText style={styles.signupLinkText}>
            Don’t have an account? Sign Up
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  titleText: {
    fontSize: 28,
    color: "#1E88E5",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formSection: {
    marginBottom: 20,
  },
  signupLinkText: {
    textAlign: "center",
    color: "#1E88E5",
  },
});
