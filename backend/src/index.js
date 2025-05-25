import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

// store secrets and keys in .env file.
import dotenv from 'dotenv';

//allow the frontend to send requests to the backend API.
import cors from 'cors';

import {app,server} from './lib/socket.js';
import connectDB from './lib/db.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';


dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

//middleware

//parse json from request body
app.use(express.json());

//parse cookies from requests
app.use(cookieParser()); 

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

//routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// start the server and connect to db.
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});