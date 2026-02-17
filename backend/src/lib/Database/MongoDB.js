import mongoose from "mongoose";

export const connectMongoDB = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`connection established on ${connect.connection.host}`);

        // debug: print indexes on the Users collection so we can detect any
        // unexpected TTL indexes that might be deleting documents.
        const db = connect.connection.db;
    } catch (error) {
        console.log(error);
    }
}