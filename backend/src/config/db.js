// config the dataBast inside of the db.js rather than bother
import mongoose from "mongoose";


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Connectiong to MongoDB: ${error.message}`);
    process.exit(1); // I Think this makes Exit if any failure
  }
};

export default connectDB;
