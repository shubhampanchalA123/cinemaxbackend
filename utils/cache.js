const { getClient, isRedisConnected } = require('../config/redis');

const CACHE_EXPIRY = 1800; // 30 minutes in seconds

const getCachedData = async (key) => {
  try {
    if (!isRedisConnected()) return null;
    const client = getClient();
    if (!client) return null;
    
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // Cache miss - not critical
    return null;
  }
};

const setCachedData = async (key, data) => {
  try {
    if (!isRedisConnected()) return;
    const client = getClient();
    if (!client) return;
    
    await client.setEx(key, CACHE_EXPIRY, JSON.stringify(data));
  } catch (error) {
    // Cache write failure - not critical
  }
};

module.exports = { getCachedData, setCachedData };