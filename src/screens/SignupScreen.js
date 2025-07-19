import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  Easing,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppText from "../components/AppText";
import CustomButton from "../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

 // Animation for fade-in effect- using the useRef hook to create a persistent animated value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignup = async () => {
    if (!fullName || !signupEmail || !signupPassword || !agreed) {
      alert("Please fill all fields and accept terms");
      return;
    }

    // Saving credentials using AsyncStorage
    const userData = { fullName, email: signupEmail, password: signupPassword };
    await AsyncStorage.setItem("userData", JSON.stringify(userData));

    alert("Account Created! You can login now");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <AppText bold style={styles.headerTitle}>
          Create Account
        </AppText>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.inputField}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Your Email"
            value={signupEmail}
            onChangeText={setSignupEmail}
            style={styles.inputField}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={signupPassword}
            onChangeText={setSignupPassword}
            style={[styles.inputField, { flex: 1 ,borderRightWidth: 0,}]}

            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
        >
          <Ionicons
            name={agreed ? "checkbox" : "square-outline"}
            size={22}
            color={agreed ? "#4CAF50" : "#999"}
          />
          <AppText style={styles.checkboxText}>
            I agree to the <AppText bold>Terms & Conditions</AppText> and{" "}
            <AppText bold>Privacy Policy</AppText>
          </AppText>
        </TouchableOpacity>

  
        <CustomButton title="Create Account" onPress={handleSignup} />

        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() => navigation.replace("Login")}
        >
          <AppText style={styles.loginLink}>
            Already have an account? Login
          </AppText>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputField: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontFamily: "Roboto-Regular",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  loginLink: {
    textAlign: "center",
    color: "#1E88E5",
  },
});
