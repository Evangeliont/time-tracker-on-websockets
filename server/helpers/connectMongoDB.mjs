import { MongoClient } from "mongodb";

let db;

const connectDB = async () => {
  if (!db) {
    try {
      const client = await MongoClient.connect(process.env.DB_URI, {
        maxPoolSize: 10,
      });
      db = client.db("timers");
      console.log("MongoDB connected");
    } catch (error) {
      console.error("Error connecting to MongoDB", error);
      process.exit(1);
    }
  }
  return db;
};

const getDB = () => db;

export { connectDB, getDB };
