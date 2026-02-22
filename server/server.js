require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const forumRoutes = require("./routes/forumRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const teamRoutes = require("./routes/teamRoutes");
const messageRoutes = require("./routes/messageRoutes");
const contactRoutes = require("./routes/contactRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const adminMessageRoutes = require("./routes/adminMessageRoutes");
const directMessageRoutes = require("./routes/directMessageRoutes");
const recoveryRequestRoutes = require("./routes/recoveryRequestRoutes");
const publicRoutes = require("./routes/publicRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Create app FIRST
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://idea-spark-olive.vercel.app",
    ],
  },
});
app.set("io", io);

/* =========================
   Middleware
========================= */

// CORS (allow frontend + local dev)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://idea-spark-olive.vercel.app",
    ],
  })
);

app.use(express.json());

/* =========================
   Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/admin-messages", adminMessageRoutes);
app.use("/api/direct-messages", directMessageRoutes);
app.use("/api/recovery-requests", recoveryRequestRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/activity", activityRoutes);

// Health check (IMPORTANT for Render debugging)
app.get("/", (req, res) => {
  res.send("IdeaSpark API is running 🚀");
});

/* =========================
   Database
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   Server
========================= */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinTeam', (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team ${teamId}`);
  });

  socket.on('joinIdea', (ideaId) => {
    if (!ideaId) return;
    const room = `idea:${ideaId}`;
    socket.join(room);
  });

  socket.on('sendMessage', async (data) => {
    const { teamId, content, senderId } = data;
    try {
      const Message = require('./models/Message');
      const message = new Message({
        content,
        sender: senderId,
        team: teamId,
      });
      await message.save();
      await message.populate('sender', 'name');
      io.to(teamId).emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
