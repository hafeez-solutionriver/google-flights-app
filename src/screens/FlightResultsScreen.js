import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar
} from "react-native";
import AppText from "../components/AppText";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function FlightResultsScreen({ route, navigation }) {
  const { flights, searchParams } = route.params;
console.log("search params", searchParams);
  const renderFlightCard = ({ item, index }) => {
    console.log(`Flight ${index + 1}:`, item);
    
    
    const price = item.price?.formatted || 
                  `$${item.price?.raw}` || 
                  item.pricingOptions?.[0]?.price?.formatted ||
                  `$${item.pricingOptions?.[0]?.price?.amount}` ||
                  "N/A";
    
    const segments = item.legs?.[0]?.segments || 
                    item.segments || 
                    [];

    //Extracting flight timing information
    const leg = item.legs?.[0];
    const departure = leg?.departure ? new Date(leg.departure).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
    const arrival = leg?.arrival ? new Date(leg.arrival).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
    const duration = leg?.durationInMinutes ? 
      `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m` : '';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <AppText bold style={{ fontSize: 20, color: "#2E8B57" }}>
            {price}
          </AppText>
          {leg?.stopCount !== undefined && (
            <View style={[
              styles.stopsBadge, 
              { backgroundColor: leg.stopCount === 0 ? '#e8f5e8' : '#fff3cd' }
            ]}>
              <AppText style={{ 
                fontSize: 11, 
                color: leg.stopCount === 0 ? '#2E8B57' : '#856404',
                fontWeight: '600'
              }}>
                {leg.stopCount === 0 ? 'DIRECT' : `${leg.stopCount} STOP${leg.stopCount > 1 ? 'S' : ''}`}
              </AppText>
            </View>
          )}
        </View>

     
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <AppText bold style={{ fontSize: 18, color: '#333' }}>
            {leg?.origin?.displayCode || searchParams.origin?.skyId || 'DEP'} → {leg?.destination?.displayCode || searchParams.destination?.skyId || 'ARR'}
          </AppText>
          {duration && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <AppText style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                {duration}
              </AppText>
            </View>
          )}
        </View>

     
        {(departure || arrival) && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ alignItems: 'flex-start' }}>
              <AppText style={{ fontSize: 12, color: "#666" }}>Departure</AppText>
              <AppText bold style={{ fontSize: 16, color: '#333' }}>
                {departure || 'N/A'}
              </AppText>
            </View>
            <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <View style={styles.flightPath}>
                <View style={styles.flightPathLine} />
                <Ionicons name="airplane" size={16} color="#2E8B57" style={styles.airplaneIcon} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={{ fontSize: 12, color: "#666" }}>Arrival</AppText>
              <AppText bold style={{ fontSize: 16, color: '#333' }}>
                {arrival || 'N/A'}
              </AppText>
            </View>
          </View>
        )}

        {/* Carrier information */}
        {leg?.carriers?.marketing?.[0] && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="business-outline" size={14} color="#666" />
            <AppText style={{ fontSize: 13, color: "#666", marginLeft: 6 }}>
              {leg.carriers.marketing[0].name}
            </AppText>
          </View>
        )}

    
        {item.tags && item.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {item.tags.map((tag, tagIndex) => (
              <View key={tagIndex} style={[
                styles.tag,
                { backgroundColor: getTagColor(tag) }
              ]}>
                <AppText style={{ fontSize: 10, color: '#fff', textTransform: 'capitalize', fontWeight: '600' }}>
                  {tag.replace('_', ' ')}
                </AppText>
              </View>
            ))}
          </View>
        )}

      
        <TouchableOpacity style={styles.bookButton}>
          <AppText bold style={{ color: '#fff', fontSize: 14 }}>
            Select Flight
          </AppText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'cheapest': return '#28a745';
      case 'fastest': return '#007bff';
      case 'shortest': return '#17a2b8';
      case 'third_shortest': return '#6c757d';
      default: return '#6f42c1';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <AppText bold style={styles.headerTitle}>Flight Results</AppText>
        <AppText style={styles.headerSubtitle}>
          {searchParams.originCity.split(' (')[0]} → {searchParams.destinationCity.split(' (')[0]}
        </AppText>
        <AppText style={styles.headerDate}>
          {searchParams.date}
        </AppText>
      </View>
    </View>
  );

  const renderResultsHeader = () => (
    <View style={styles.resultsHeader}>
      <AppText bold style={styles.resultsCount}>
        {flights.length} flights found
      </AppText>
      <TouchableOpacity style={styles.sortButton}>
        <Ionicons name="filter-outline" size={16} color="#2E8B57" />
        <AppText style={{ fontSize: 12, color: "#2E8B57", marginLeft: 4 }}>
          Sort & Filter
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {renderHeader()}
      
      <View style={styles.contentContainer}>
        {renderResultsHeader()}
        
        <FlatList
          data={flights}
          keyExtractor={(item, idx) => `${item.id || idx}`}
          renderItem={renderFlightCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4"
  },
  header: {
    backgroundColor: "#2E8B57",
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff"
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9
  },
  headerDate: {
    fontSize: 12,
    color: "#fff",
    marginTop: 2,
    opacity: 0.8
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4"
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  resultsCount: {
    fontSize: 16,
    color: "#333"
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2E8B57",
    borderRadius: 20
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  stopsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  flightPath: {
    position: 'relative',
    width: 80,
    height: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flightPathLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    position: 'absolute'
  },
  airplaneIcon: {
    backgroundColor: '#fff',
    paddingHorizontal: 4
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4
  },
  bookButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  }
});