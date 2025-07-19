import React, { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
        "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
        "Roboto-Light": require("./assets/fonts/Roboto-Light.ttf"),
      });
      setIsReady(true);
      SplashScreen.hideAsync();
    }
    loadFonts();
  }, []);

  if (!isReady) return null;

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
