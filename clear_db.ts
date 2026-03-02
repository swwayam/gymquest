import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://swaym:Swayam%403434%23@cluster0.mh1qqsx.mongodb.net/?appName=Cluster0";

async function clearDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
    await mongoose.connection.db?.dropDatabase();
    console.log("Database dropped successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearDb();
