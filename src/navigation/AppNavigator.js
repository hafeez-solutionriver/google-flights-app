import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchFlightsScreen from "../screens/SearchFlightsScreen";
import { AuthContext } from "../context/AuthContext";
import FlightResultsScreen from '../screens/FlightResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{  headerTintColor: "#fff", headerStyle: { backgroundColor: "#007bff"} }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SearchFlights" component={SearchFlightsScreen} />
            <Stack.Screen name="FlightResults" component={FlightResultsScreen}
  
/>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
