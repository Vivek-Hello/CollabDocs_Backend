import mongoose from "mongoose";

export const connectDb = async()=>{
    try {
        const connect = mongoose.connect(process.env.DB);
        console.log("db is connected");
    } catch (error) {
        console.log("the db connection error");
    }
}