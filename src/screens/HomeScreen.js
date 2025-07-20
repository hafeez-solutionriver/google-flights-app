import React, { useState, useContext, useMemo, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  Alert
} from "react-native";
import debounce from "lodash.debounce";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../components/AppText";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";
import { searchAirport, searchFlights, validateFlightSearchParams } from "../api/flightsApi";

import Ionicons from "react-native-vector-icons/Ionicons";

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);

  // States for each input field and suggestions
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [travelDate, setTravelDate] = useState(new Date());

  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchingAirports, setSearchingAirports] = useState(false);
  const [flights, setFlights] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasSearchedFlights, setHasSearchedFlights] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Debounced airport search function
  const fetchAirportSuggestions = useCallback(async (query, isOrigin) => {
    if (!query || query.length < 2) {
      if (isOrigin) setOriginSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    try {
      setSearchingAirports(true);
      console.log(`Searching ${isOrigin ? 'origin' : 'destination'} airports for: "${query}"`);
      
      const results = await searchAirport(query);
      console.log(`Found ${results?.length || 0} airports for "${query}"`);
      
      if (isOrigin) setOriginSuggestions(results || []);
      else setDestinationSuggestions(results || []);
    } catch (error) {
      console.error("Error fetching airport suggestions:", error);
    } finally {
      setSearchingAirports(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(fetchAirportSuggestions, 600),
    [fetchAirportSuggestions]
  );

  const handleInputChange = useCallback((text, isOrigin) => {
    if (isOrigin) {
      setOriginCity(text);
      setSelectedOrigin(null);
    } else {
      setDestinationCity(text);
      setSelectedDestination(null);
    }
    
    // Reset flights and error when input changes
    if (hasSearchedFlights) {
      setFlights([]);
      setHasSearchedFlights(false);
    }
    setApiError(null);
    
    debouncedFetch(text, isOrigin);
  }, [debouncedFetch, hasSearchedFlights]);

  const handleSelectAirport = useCallback((airport, isOrigin) => {
    console.log(`Selected ${isOrigin ? 'origin' : 'destination'} airport:`, airport);
    
    const label = `${airport.presentation.title} (${airport.skyId})`;
    
    if (isOrigin) {
      setOriginCity(label);
      setSelectedOrigin(airport);
      setOriginSuggestions([]);
    } else {
      setDestinationCity(label);
      setSelectedDestination(airport);
      setDestinationSuggestions([]);
    }
    
    // Resetting flights when an airport is selected
    if (hasSearchedFlights) {
      setFlights([]);
      setHasSearchedFlights(false);
    }
    setApiError(null);
  }, [hasSearchedFlights]);

  const handleSearchFlights = useCallback(async () => {
    if (!selectedOrigin || !selectedDestination) {
      Alert.alert("Missing Information", "Please select valid airports for both origin and destination!");
      return;
    }

    // In order to Prevent double execution we need to check if loading is true
    if (loading) return;

    const dateStr = travelDate.toISOString().split("T")[0];
    
    const searchParams = {
      originSkyId: selectedOrigin.skyId,
      originEntityId: selectedOrigin.entityId,
      destinationSkyId: selectedDestination.skyId,
      destinationEntityId: selectedDestination.entityId,
      date: dateStr,
    };

    //Validating parameters before sending
    const validation = validateFlightSearchParams(searchParams);
    if (!validation.isValid) {
      Alert.alert("Invalid Parameters", validation.message);
      return;
    }

    console.log("Starting flight search...");
    console.log("Selected Origin:", selectedOrigin);
    console.log("Selected Destination:", selectedDestination);
    console.log("Flight search parameters:", searchParams);

    setLoading(true);
    setHasSearchedFlights(true);
    setApiError(null);

    try {
      // In this API call, we are assuming the 1 adult book sitting in economy class for simplicity
      const flightsResponse = await searchFlights(searchParams);
      
      console.log("✅ Flight search response:", flightsResponse);

      // Handle different response cases
      if (flightsResponse?.error) {
        setApiError(flightsResponse.message || "Flight search failed");
        setFlights([]);
      } else if (flightsResponse?.status === true && flightsResponse?.data?.itineraries) {
        const foundFlights = flightsResponse.data.itineraries;
        console.log(`Found ${foundFlights.length} flights`);
        setFlights(foundFlights);
        
        if (foundFlights.length === 0) {
          console.log("No flights available for this route");
        }
      } else {
        console.log("Unexpected response structure:", flightsResponse);
        setFlights([]);
        setApiError("No flights found for this route and date");
      }
    } catch (error) {
      console.error("Error in flight search:", error);
      setApiError("Failed to search flights. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrigin, selectedDestination, travelDate, loading]);

  const renderSuggestion = (airport, isOrigin) => (
    <TouchableOpacity
      key={airport.entityId}
      style={styles.suggestionItem}
      onPress={() => handleSelectAirport(airport, isOrigin)}
    >
      <AppText bold>{airport.presentation.suggestionTitle}</AppText>
      <AppText style={{ fontSize: 12, color: "#666" }}>
        {airport.presentation.subtitle}
      </AppText>
      <AppText style={{ fontSize: 10, color: "#999" }}>
        Sky ID: {airport.skyId} | Entity ID: {airport.entityId}
      </AppText>
    </TouchableOpacity>
  );

 const renderFlightCard = ({ item, index }) => {
  console.log(`Flight ${index + 1}:`, JSON.stringify(item, null, 2));
  
  // Enhanced price extraction with safety checks
  let price = "N/A";
  
  try {
    if (item.price?.formatted) {
      price = String(item.price.formatted);
    } else if (item.price?.raw) {
      price = `$${item.price.raw}`;
    } else if (item.pricingOptions?.[0]?.price?.formatted) {
      price = String(item.pricingOptions[0].price.formatted);
    } else if (item.pricingOptions?.[0]?.price?.amount) {
      price = `$${item.pricingOptions[0].price.amount}`;
    } else if (item.rawPrice) {
      price = `$${item.rawPrice}`;
    } else if (item.formattedPrice) {
      price = String(item.formattedPrice);
    }
    console.log('Extracted price:', price);
  } catch (error) {
    console.error('Error extracting price:', error);
    price = "N/A";
  }

  // Enhancing segments extraction with safety checks
  const segments = item.legs?.[0]?.segments || item.segments || [];

  // Enhanced flight timing information with safety checks
  const leg = item.legs?.[0] || item;
  let departure = '';
  let arrival = '';
  let duration = '';
  let originCode = '';
  let destinationCode = '';
  let stopCount = null;
  let airlineName = '';

  // Safely extracting flight details
  try {
   
    if (leg.departure) {
      departure = new Date(leg.departure).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    console.log('Departure time:', departure);
    
   
    if (leg.arrival) {
      arrival = new Date(leg.arrival).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    console.log('Arrival time:', arrival);
    
   
    if (leg.durationInMinutes) {
      duration = `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m`;
    } else if (leg.duration) {
      duration = String(leg.duration);
    }
    console.log('Duration:', duration);

   
    originCode = leg?.origin?.displayCode || leg?.originCode || 'DEP';
    destinationCode = leg?.destination?.displayCode || leg?.destinationCode || 'ARR';
    console.log('Route:', originCode, '→', destinationCode);

   
    if (leg?.stopCount !== undefined) {
      stopCount = leg.stopCount;
    }
    console.log('Stop count:', stopCount);

    
    if (leg?.carriers?.marketing?.[0]?.name) {
      airlineName = String(leg.carriers.marketing[0].name);
    } else if (leg?.airline?.name) {
      airlineName = String(leg.airline.name);
    } else if (leg?.airline && typeof leg.airline === 'string') {
      airlineName = leg.airline;
    }
    console.log('Airline:', airlineName);

  } catch (error) {
    // Log any errors encountered while extracting flight details
    console.error('Error extracting flight details:', error);
  }

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <AppText bold style={{ fontSize: 18, color: "#2E8B57" }}>
          {price}
        </AppText>
        {stopCount !== null && (
          <AppText style={{ fontSize: 12, color: "#666" }}>
            {stopCount === 0 ? 'Direct' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`}
          </AppText>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <AppText bold style={{ fontSize: 16 }}>
          {originCode} → {destinationCode}
        </AppText>
        {duration && (
          <AppText style={{ fontSize: 12, color: "#666" }}>
            {duration}
          </AppText>
        )}
      </View>

      {(departure || arrival) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <AppText style={{ fontSize: 14 }}>
            Depart: {departure || 'N/A'}
          </AppText>
          <AppText style={{ fontSize: 14 }}>
            Arrive: {arrival || 'N/A'}
          </AppText>
        </View>
      )}

      {airlineName && (
        <AppText style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Airline: {airlineName}
        </AppText>
      )}

      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {item.tags.map((tag, tagIndex) => {
            const tagText = typeof tag === 'string' ? tag.replace('_', ' ') : String(tag);
            return (
              <View key={tagIndex} style={{ 
                backgroundColor: '#e8f5e8', 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                borderRadius: 12, 
                marginRight: 6, 
                marginBottom: 4 
              }}>
                <AppText style={{ fontSize: 10, color: '#2E8B57', textTransform: 'capitalize' }}>
                  {tagText}
                </AppText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", bottom: 20 }}> 
        <AppText bold style={styles.heading}>Search Flights</AppText>
        <TouchableOpacity onPress={logout} style={{ marginStart: 30 }}>
          <AppText style={{ color: "red" }} bold={true}>Logout</AppText>
        </TouchableOpacity>
      </View>
      
      <Image
        source={require("../../assets/images/flightbooking.png")}
        style={{ width: 130, height: 130, alignSelf: "center", marginBottom: 20 }}
        resizeMode="contain"
      />

      
      {apiError && (
        <View style={styles.errorCard}>
          <AppText style={{ color: "red", textAlign: "center" }}>
            {apiError}
          </AppText>
        </View>
      )}
      
   
      <View style={{ position: "relative", zIndex: 5 }}>
        <TextInput
          placeholder="Origin City (e.g., New York, London)"
          style={styles.inputField}
          value={originCity}
          onChangeText={(text) => handleInputChange(text, true)}
        />
        {searchingAirports && originCity.length > 0 && !selectedOrigin && (
          <ActivityIndicator size="small" color="blue" style={{ marginVertical: 5 }} />
        )}
        {originSuggestions.length > 0 && (
          <View style={styles.dropdownAbsolute}>
            {originSuggestions.map((airport) => renderSuggestion(airport, true))}
          </View>
        )}
      </View>

 
      <View style={{ position: "relative", zIndex: 4 }}>
        <TextInput
          placeholder="Destination City (e.g., Paris, Tokyo)"
          style={styles.inputField}
          value={destinationCity}
          onChangeText={(text) => handleInputChange(text, false)}
        />
        {searchingAirports && destinationCity.length > 0 && !selectedDestination && (
          <ActivityIndicator size="small" color="blue" style={{ marginVertical: 5 }} />
        )}
        {destinationSuggestions.length > 0 && (
          <View style={styles.dropdownAbsolute}>
            {destinationSuggestions.map((airport) => renderSuggestion(airport, false))}
          </View>
        )}
      </View>

     
      <TouchableOpacity style={styles.dateInputWrapper} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={22} color="#555" style={{ marginRight: 10 }} />
        <AppText style={{ fontSize: 16, color: "#333" }}>
          {travelDate.getDate()}{" "}
          {travelDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric" }).toUpperCase()}
        </AppText>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={travelDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()} // We need to make sure the user can't select a past date
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setTravelDate(selectedDate);
          }}
        />
      )}

      
      <CustomButton
        title={loading ? "Searching..." : "Search Flights"}
        onPress={handleSearchFlights}
        disabled={loading || !selectedOrigin || !selectedDestination}
      />

     
      {loading && <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />}

      {!loading && flights.length > 0 && (
        <>
          <AppText bold style={{ fontSize: 18, marginVertical: 10, color: "#2E8B57" }}>
            Found {flights.length} Available Flights
          </AppText>
          <FlatList
            data={flights}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={renderFlightCard}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}

      
      {!loading && flights.length === 0 && hasSearchedFlights && selectedOrigin && selectedDestination && !apiError && (
        <View style={styles.noFlightsCard}>
          
          <View style={styles.airportMiniCard}>
            <Image    
              source={require("../../assets/images/plane-takeoff.png")} 
              style={{ width: 30, height: 30 }}
              resizeMode="contain" 
            />
            <AppText bold style={{ fontSize: 14, textAlign: "center", marginTop: 4 }}>
              {selectedOrigin.presentation?.title || "Origin"}
            </AppText>
          </View>

         
          <Ionicons name="arrow-forward" size={50} color="#333" style={{ marginHorizontal: 10 }} />

          
          <View style={styles.airportMiniCard}>
            <Image    
              source={require("../../assets/images/plane-landing.png")} 
              style={{ width: 30, height: 30 }}
              resizeMode="contain" 
            />
            <AppText bold style={{ fontSize: 14, textAlign: "center", marginTop: 4 }}>
              {selectedDestination.presentation?.title || "Destination"}
            </AppText>
          </View>
        </View>
      )}

      {!loading && flights.length === 0 && hasSearchedFlights && selectedOrigin && selectedDestination && !apiError && (
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
          <Image
            source={require("../../assets/images/ticket.png")}
            style={{ width: 30, height: 30, marginRight: 10 }}
            resizeMode="contain"
          />
          <AppText style={{ textAlign: "center", color: "#666" }}>
            No flights available for this route on {travelDate.toDateString()}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  heading: { fontSize: 22, textAlign: "center", marginBottom: 20, marginTop: 20, marginStart: 80 },
  inputField: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  dropdownAbsolute: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    elevation: 10,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorCard: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  noFlightsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 3,
  },
  airportMiniCard: {
    width: 100,
    height: 80,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});