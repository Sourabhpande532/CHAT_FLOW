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

const allowedOrigins = [
  "https://chat-flow-swart.vercel.app",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

// Established new socket.io server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongodb connected."))
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to express routing library");
});

// Socket.io logic
io.on("connection", (socket) => {
  // Listen for send_message event from client
  socket.on("send_message", async (data) => {
    try {
      const sender = typeof data?.sender === "string" ? data.sender.trim() : "";
      const receiver = typeof data?.receiver === "string" ? data.receiver.trim() : "";
      const message = typeof data?.message === "string" ? data.message.trim() : "";
      if (!sender || !receiver || !message) return;

      const newMessage = new Messages({ sender, receiver, message });
      await newMessage.save();

      socket.broadcast.emit("receive_message", {
        ...data,
        _id: newMessage._id,
        sender,
        receiver,
        message,
        read: newMessage.read,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });

  // Typing indicator
  socket.on("typing", (payload) => {
    if (!payload?.sender) return;
    socket.broadcast.emit("user_typing", {
      sender: payload.sender,
      receiver: payload.receiver,
    });
  });

  socket.on("stop_typing", (payload) => {
    socket.broadcast.emit("user_stop_typing", {
      sender: payload?.sender,
      receiver: payload?.receiver,
    });
  });

  // Read receipt
  socket.on("mark_read", async (payload) => {
    try {
      const sender = typeof payload?.sender === "string" ? payload.sender.trim() : "";
      const receiver = typeof payload?.receiver === "string" ? payload.receiver.trim() : "";
      if (!sender || !receiver) return;

      await Messages.updateMany(
        { sender, receiver, read: false },
        { read: true },
      );
      socket.broadcast.emit("messages_read", { sender, receiver });
    } catch (error) {
      console.error("Error marking messages read:", error.message);
    }
  });

  socket.on("disconnect", () => {});
});

// Fetch messages list between two users
app.get("/messages", async (req, res) => {
  const { sender, receiver } = req.query;
  if (!sender || !receiver) {
    return res.json([]);
  }
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
    const query = currentUser ? { username: { $ne: currentUser } } : {};
    const users = await User.find(query)
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
