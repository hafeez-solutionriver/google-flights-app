import React, { useState, useEffect, useRef,useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  Easing,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppText from "../components/AppText";
import CustomButton from "../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

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

  const handleLogin = async () => {
    const storedData = await AsyncStorage.getItem("userData");
    if (!storedData) {
      alert("No account found. Please sign up first.");
      return;
    }

    const parsedData = JSON.parse(storedData);

    if (
      parsedData.email === loginEmail &&
      parsedData.password === loginPassword
    ) {
      login(parsedData); // Call login function from AuthContext
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    
    <SafeAreaView style={styles.screenContainer}>
      <AppText bold style={styles.headerTitle}>
        Flight Booking App
      </AppText>
       <Image  
          source={require("../../assets/images/airplane.png")}
          style={{width:100,height:100,alignSelf:"center",marginBottom:70}}
          resizeMode="contain"
        />
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
       
          <View style={{ alignItems: "center", marginBottom: 15}}>
                 <Image
                   source={require("../../assets/images/login.png")} 
                   style={{ width: 60,height: 60}}
                   resizeMode="contain"
                 />
               </View>

    
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Username or Email"
            value={loginEmail}
            onChangeText={setLoginEmail}
            style={styles.inputField}
            placeholderTextColor="#999"
          />
        </View>

   
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={loginPassword}
            onChangeText={setLoginPassword}
            style={[styles.inputField, { flex: 1 ,borderRightWidth: 0,}]}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        
        <TouchableOpacity>
          <AppText style={styles.forgotText}>Forgot Password?</AppText>
        </TouchableOpacity>

       
        <CustomButton title="Login" onPress={handleLogin} />

    
        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() => navigation.replace("Signup")}
        >
          <AppText style={styles.signupLink}>
            Don’t have an account? Sign Up
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
    marginHorizontal:20,
    marginBottom: 80,
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
  headerTitle: {
    fontSize: 26,
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
    marginBottom: 10,
  },
  forgotText: {
    textAlign: "right",
    color: "#666",
    fontSize: 13,
    marginBottom: 20,
  },
  signupLink: {
    textAlign: "center",
    color: "#1E88E5",
  },
});
