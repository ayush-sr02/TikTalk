const express = require('express');
const path = require('path');

// store secrets and keys in .env file.
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

//allow the frontend to send requests to the backend API.
const cors = require('cors');
dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

const {app,server} = require('./lib/socket');

const { connectDB } = require('./lib/db');
const authRouter = require('./routes/auth.route');
const messageRouter = require('./routes/message.route');

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

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

// start the server and connect to db.
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});