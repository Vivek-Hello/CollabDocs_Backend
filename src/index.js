import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDb } from "./utils/db.js";
import UserRoute from "./routes/User.routes.js";
import Docsrouter from "./routes/Document.routes.js";
import cookieParser from "cookie-parser";
dotenv.config();
const port =  process.env.PORT;
const app =  express();



app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors({
    origin:process.env.frontend_url,
    credentials:true
}))

app.use('/api/user',UserRoute);
app.use("/api/docs",Docsrouter)

app.listen(port,()=>{
    console.log('====================================');
        console.log(`http://localhost:${port}`);
        connectDb();
    console.log('====================================');
})