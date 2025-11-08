import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        // Pass the DB name as an option instead of concatenating it onto the URI.
        // This prevents accidentally corrupting query strings (e.g. when MONGODB_URI already contains `/?...`).
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
        console.log(`MongoDB connected :${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("mongoDB connection ERROR :",error);
        process.exit(1);
    }
}

export default connectDB;