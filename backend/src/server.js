import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import { connectMongoDB } from "./lib/Database/MongoDB.js";
import {connectPgDB} from "./lib/Database/Postgres.js";
config();
const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
}))
const port = process.env.PORT;

app.use("/api/auth" , authRoutes) ;

app.listen(port , ()=>
{
    console.log("Server running on localhost : "+port);
    connectMongoDB();
    connectPgDB();
})
