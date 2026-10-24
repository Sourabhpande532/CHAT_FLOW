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

// Established new socket.io server
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

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  
  // Listen for send_message event from client
  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;
    const newMessage = new Messages({ sender, receiver, message });
    await newMessage.save();
    socket.broadcast.emit("receive_message", data);
  });

  // Typing indicator
  socket.on("typing", ({ sender, receiver }) => {
    socket.broadcast.emit("user_typing", { sender, receiver });
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    socket.broadcast.emit("user_stop_typing", { sender, receiver });
  });

  // Read receipt
  socket.on("mark_read", async ({ sender, receiver }) => {
    await Messages.updateMany(
      { sender, receiver, read: false },
      { read: true },
    );
    socket.broadcast.emit("messages_read", { sender, receiver });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Fetch messages list between two users
app.get("/messages", async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Messages.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ messages: "Error fetching messages." });
  }
});

// Fetching all registered users except current user
app.get("/users", async (req, res) => {
  const { currentUser } = req.query;
  try {
    const users = await User.find({ username: { $ne: currentUser } })
      .select("username createdAt")
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () =>
  console.log(`Server running on port at http://localhost:${PORT}`),
);
