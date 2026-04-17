const axios = require('axios');
const { getCachedData, setCachedData } = require('../utils/cache');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

const fetchFromTMDB = async (endpoint, params = {}) => {
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;
  
  // Try cache first
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const response = await tmdbApi.get(endpoint, { params });
    const data = response.data;
    
    // Cache the result
    await setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    throw new Error(`TMDB API error: ${error.response?.data?.status_message || error.message}`);
  }
};

module.exports = { fetchFromTMDB };