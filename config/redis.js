const redis = require('redis');

let client = null;
let isConnected = false;

const createClient = async () => {
  try {
    const tempClient = redis.createClient({
      url: process.env.REDIS_URL,
    });

    tempClient.on('error', (err) => {
      // Silently handle errors - Redis is optional
    });

    await tempClient.connect();
    client = tempClient;
    isConnected = true;
    console.log('Redis connected');
    return true;
  } catch (error) {
    console.log('Redis not available - caching disabled (optional)');
    isConnected = false;
    return false;
  }
};

const connectRedis = async () => {
  await createClient();
};

const getClient = () => client;
const isRedisConnected = () => isConnected;

module.exports = { getClient, connectRedis, isRedisConnected };