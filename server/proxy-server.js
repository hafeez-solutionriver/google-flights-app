// This is a proxy server for flight search requests
// It handles requests to the Sky Scrapper API and returns flight data
// This was jsut for testing purposes, now we use the flightsApi.js file

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

/**
 * GET /flights?originSkyId=&originEntityId=&destinationSkyId=&destinationEntityId=&date=
 */
app.get("/flights", async (req, res) => {
  const { originSkyId, originEntityId, destinationSkyId, destinationEntityId, date } = req.query;

  if (!originSkyId || !originEntityId || !destinationSkyId || !destinationEntityId || !date) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    console.log("Proxying flight search:", req.query);

    const response = await axios.get(
      "https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights", 
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/112 Safari/537.36",
          "x-rapidapi-key": "934f617a0cmsh40b8a1b1b06a79ep199ac0jsn80dab6452366",
          "x-rapidapi-host": "sky-scrapper.p.rapidapi.com"
        },
        params: {
          originSkyId,
          originEntityId,
          destinationSkyId,
          destinationEntityId,
          date
        },
        timeout: 100000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Proxy failed",
      details: error.response?.data || error.message
    });
  }
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));
