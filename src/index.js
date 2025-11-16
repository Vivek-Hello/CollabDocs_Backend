import express from "express";
import http from "http"; // <-- add this
import { Server as SocketIOServer } from "socket.io"; // <-- add this too
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from "./utils/db.js";
import UserRoute from "./routes/User.routes.js";
import Docsrouter from "./routes/Document.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const port = process.env.PORT;
const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.frontend_url,
  credentials: true,
}));

app.use('/api/user', UserRoute);
app.use("/api/docs", Docsrouter);

// --- Swap app.listen for http server ---
const server = http.createServer(app); // <-- create HTTP server

// --- Socket.IO setup ---
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.frontend_url, // make sure this matches frontend CORS
    credentials: true,
  },
});

// --- Real-time handlers ---
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join document room
  socket.on("joinDoc", ({ docId }) => {
    socket.join(docId);
    console.log("Socket joined doc:", docId);
  });

  // Listen for doc changes
  socket.on("docChange", ({ docId, content }) => {
    // TODO: Add permission/auth check here before broadcasting!
    // Broadcast the new content to other users in the room
    socket.to(docId).emit("docChangeRemote", { content });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// --- Server start ---
server.listen(port, () => {
  console.log('====================================');
  console.log(`http://localhost:${port}`);
  connectDb();
  console.log('====================================');
});

// --- Attach io to app for access in routes (optional) ---
app.set("io", io);
