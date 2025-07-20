import axios from "axios";

// API Configuration
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_HEADERS = {
  "X-RapidAPI-Key": process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
  "X-RapidAPI-Host": process.env.EXPO_PUBLIC_RAPIDAPI_HOST
};

// We need to ensure the API configuration is valid before making requests
// This function checks if the required headers are set
// and logs an error if they are missing
const validateConfig = () => {
  if (!API_HEADERS["X-RapidAPI-Key"] || !API_HEADERS["X-RapidAPI-Host"]) {
    console.error("Error! Missing required API configuration!");
    return false;
  }
  return true;
};

// Searching for airports by city query
export const searchAirport = async (cityQuery) => {
  if (!validateConfig()) return [];

  try {
    console.log("Searching airports for:", cityQuery);

    // Endpoint for searching airports
    const endpoint = `${API_BASE}/api/v1/flights/searchAirport`;
    
    const response = await axios.get(endpoint, {
      headers: API_HEADERS,
      params: {
        query: cityQuery.trim()
      },
      timeout: 15000,
    });

    console.log("Airport search response:", response.data);

    
    if (response.data?.status === true && response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.log("Unexpected airport response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error searching airport:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    return [];
  }
};


// In this API call, we are assuming the 1 adult book sitting in economy class
export const searchFlights = async ({
  originSkyId,
  originEntityId,
  destinationSkyId,
  destinationEntityId,
  date,
}) => {
  if (!validateConfig()) {
    return { error: true, message: "API configuration missing" };
  }

  try {
    console.log("Searching flights with params:", {
      originSkyId,
      originEntityId,
      destinationSkyId,
      destinationEntityId,
      date,
    });

 
    const params = {
      originSkyId: originSkyId.toString(),
      destinationSkyId: destinationSkyId.toString(),
      originEntityId: originEntityId.toString(),
      destinationEntityId: destinationEntityId.toString(),
      date: date, 
      adults: "1",
      currency: "USD",
      market: "US",
      countryCode: "US",
      cabinClass: "economy",
      sortBy: "best"
    };

    console.log("Final request params:", params);

 
    const endpoint = `${API_BASE}/api/v1/flights/searchFlights`;
    
    const response = await axios.get(endpoint, {
      headers: API_HEADERS,
      params,
      timeout: 45000, // timout for flight search
    });

    console.log("Raw Flight API Response String:", JSON.stringify(response.data, null, 2));

    // Handling response
    if (response.data) {
      //Case #1: Standard success response
      if (response.data.status === true && response.data.data) {
        let flights = [];
        
        //Try different possible paths for flight data
        if (response.data.data.itineraries) {
          flights = response.data.data.itineraries;
        } else if (response.data.data.flights) {
          flights = response.data.data.flights;
        } else if (response.data.data.results) {
          flights = response.data.data.results;
        } else if (Array.isArray(response.data.data)) {
          flights = response.data.data;
        }

        console.log(`Extracted ${flights.length} flights from API response`);

        return {
          status: true,
          data: {
            itineraries: flights,
            ...response.data.data
          },
          message: "Flights retrieved successfully"
        };
      }
      
      //Case 2: Error response from API
      else if (response.data.status === false) {
        console.log("API returned error:", response.data);
        return {
          error: true,
          message: response.data.message || "API returned an error",
          data: response.data
        };
      }
      
      //Case 3: Unexpected structure
      else {
        console.log("Unexpected API response structure:", response.data);
        return {
          error: true,
          message: "Unexpected response format from API",
          data: response.data
        };
      }
    }

    //Case 4: Empty response
    return {
      error: true,
      message: "No data received from API",
      data: null
    };

  } catch (error) {
    console.error("Flight search error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    });

    // To make error handling more user-friendly, we can provide specific messages based on the error type
    let errorMessage = "Failed to search flights";
    
    if (error.response?.status === 400) {
      errorMessage = "Invalid search parameters. Please check your inputs.";
    } else if (error.response?.status === 401) {
      errorMessage = "API authentication failed. Please check your API key.";
    } else if (error.response?.status === 403) {
      errorMessage = "API access forbidden. Check your subscription plan.";
    } else if (error.response?.status === 429) {
      errorMessage = "Too many requests. Please wait before trying again.";
    } else if (error.response?.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please check your internet connection.";
    }

    return {
      error: true,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Getting nearby airports
export const getNearByAirports = async (lat, lng) => {
  if (!validateConfig()) return [];

  try {
    console.log("Getting nearby airports for:", { lat, lng });

    const endpoint = `${API_BASE}/api/v1/flights/getNearByAirports`;
    
    const response = await axios.get(endpoint, {
      headers: API_HEADERS,
      params: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
      timeout: 15000,
    });

    console.log("Nearby airports response:", response.data);
    
    if (response.data?.status === true && response.data?.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting nearby airports:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return [];
  }
};

export const handleAPIError = (error, context = "") => {
  const errorInfo = {
    context,
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
  };

  console.error(`API Error in ${context}:`, errorInfo);

  if (error.response?.status === 401) {
    return "Invalid API key. Please check your credentials.";
  } else if (error.response?.status === 403) {
    return "API access forbidden. Check your subscription plan.";
  } else if (error.response?.status === 429) {
    return "Too many requests. Please try again in a moment.";
  } else if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  } else if (error.code === "ECONNABORTED") {
    return "Request timeout. Please check your internet connection.";
  } else {
    return `Error: ${error.message}`;
  }
};


export const validateFlightSearchParams = (params) => {
  const required = ['originSkyId', 'originEntityId', 'destinationSkyId', 'destinationEntityId', 'date'];
  const missing = required.filter(param => !params[param]);
  
  if (missing.length > 0) {
    return {
      isValid: false,
      message: `Missing required parameters: ${missing.join(', ')}`
    };
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.date)) {
    return {
      isValid: false,
      message: 'Date must be in YYYY-MM-DD format'
    };
  }
  
  return { isValid: true };
};