const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const { Server } = require("socket.io");
const Messages = require("./models/Messages");
const User = require("./models/User");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();
const server = http.createServer(app);

// instantiated/established new server
const io = new Server(server, {
  cors: {
    origin: ["https://chat-flow-swart.vercel.app", "http://localhost:3000"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongodb connected."))
  .catch((error) => console.error(error));

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to express routing library");
});

// socket io logic
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  /* socket.io this listen send_message event from the client side this event is trigger when client send the message & data contains the info of sender receiver,message */
  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;
    // Now,we have to create messages schema as well so we can put in proper formate & save to DB
    const newMessage = new Messages({ sender, receiver, message });
    await newMessage.save();
    // How receiver will know send someone message it'll notify user message has come handle in frontend end.
    socket.broadcast.emit("receive_message", data);
  });

  // Once done everything we closed connection
  // It will trigger when client disconnect from server
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// TO RECEIVEED Messages list for the frontend need to write get request for messages & users so can see list on frontend
app.get("/messages", async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Messages.find({
      $or: [
        // 1st condition
        { sender, receiver },
        // Or 2nd condition sender become receiver here & receiver become sender
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ messages: "Error fetching messages." });
  }
});
/* Explained: see after .find() So there can be two condition here 
first: sender sent a message to receiver
2nd case: receiver sent message to sender to find it from db we used $or query find those cased in DB Additionaly you can sort latest one First */

// Fetching all the register user
app.get("/users", async (req, res) => {
  const { currentUser } = req.query;
  try {
    // Here we want to find user accept currentUser supposed i logged in as sourabh i don't want my chat list separately don't want my details in this user i want all the other register user to list it
    const users = await User.find({ username: { $ne: currentUser } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () =>
  console.log(`Server running on port at http://localhost:${PORT}`),
);

/* 
STUDY:
LET"S Implement the socket.io connection
   First install: npm install socket.io
   Then bring server of socket.io
   Now befour form a Mongodb connection
   Here basically we'r creating a server it should run our app by requiring http and inserting our app. once i.o ready then write implementation below  mongo

   io.on("connection", (socket) => {
   console.log("User connected", socket.id)});
   This basically listen for a new client connection to the server. when server is connected each client has a unique ID that's why socket.id
 */
