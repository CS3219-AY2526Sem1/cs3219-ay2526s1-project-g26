import { createClient } from "redis";
import { DATABASE_URL } from "../config";

// Initialize Redis Client
const redisClient = createClient({url: DATABASE_URL})
redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();

export default redisClient