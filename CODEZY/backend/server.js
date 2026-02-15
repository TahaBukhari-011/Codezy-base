import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/payment.js";
import subscriptionRoutes from "./routes/subscription.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from './routes/studentRoutes.js';
import learnerRoutes from './routes/learnerRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import codeExecutionRoutes from "./routes/codeExecutionRoutes.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const server = createServer(app); // Use this server for Socket.IO

// Stripe webhook raw parser
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// JSON parser
app.use(express.json());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/learners', learnerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/code-execution", codeExecutionRoutes);

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRooms", ({ userId, role, classIds, fullName }) => {

    // ---- ROOM JOINING ----
    if (role === "student" && classIds?.length) {
      classIds.forEach((id) => socket.join(`students-${id}`));
    }

    if (role === "teacher" && classIds?.length) {
      classIds.forEach((id) => socket.join(`teachers-${id}`));
    }

    if (role === "individual_learner") socket.join("solo-learners");
    if (role === "admin") socket.join("admins");
    if (role === "super_admin") socket.join("super-admins");

    // ---- EPHEMERAL WELCOME (AFTER SOCKET IS READY) ----
    socket.emit("notification", {
      title: "Welcome to Codezy 👋",
      message: `Welcome back, ${fullName || "User"}!`,
      type: "SYSTEM",
      persistent: false
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in routes/controllers
app.set("io", io);

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Start server using `server` (not app)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
