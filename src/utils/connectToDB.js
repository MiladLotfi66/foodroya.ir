import mongoose from "mongoose";

async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    } else {
    //   mongoose.set("strictQuery", false); این کد سختگیری منگوس رو کم می کنه
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to DB");
    }
  } catch (error) {}
}

export default connectDB;
