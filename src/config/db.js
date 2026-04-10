import mongoose from 'mongoose';
const DB_URI = process.env.MONGODB_URI;

if (!DB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected');
      return;
    }

    if (mongoose.connection.readyState === 2) {
      console.log("Connecting...");
      return;
    }

    await mongoose.connect(DB_URI);
    console.log('DB connected');
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('DB disconnected');
    } else {
      console.log('DB already not connected');
    }
  } catch (err) {
    console.log('DB not disconnected');
    console.log(err);
  }
};

// 0 = disconnected  
// 1 = connected  
// 2 = connecting  
// 3 = disconnecting  
