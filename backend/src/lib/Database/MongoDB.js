import mongoose from "mongoose";

export const connectMongoDB = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`connection established on ${connect.connection.host}`)
    } catch (error) {
        console.log(error);
    }
}