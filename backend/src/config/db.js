// config the dataBast inside of the db.js rather than bother
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DataBase Connection Failed: ${error.message}`);
    process.exit(1); // I Think this makes Exit if any failure
  }
};

//Helper function to check the connection status
export const getDBStatus = () => {
  const dbStatus = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  const stateCode = mongoose.connection.readyState;
  return {
    status: dbStatus[stateCode] || "Unknown",
    isConnected: stateCode === 1,
  };
};

export default connectDB;
