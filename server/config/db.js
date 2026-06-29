import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
});

console.log("Mongo Ready State:", mongoose.connection.readyState);
console.log("Database:", mongoose.connection.name);

    console.log("MongoDB Connected");
  } catch (error) {
   console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default connectDB;