// src/context/socketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ user, children, onNotification }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"], // optional: force WebSocket
      auth: { token: user.token } // optional: if you want to send JWT
    });

    // Listen for successful connection
    newSocket.on("connect", () => {
      console.log("✅ Socket connected! ID:", newSocket.id);

      // Join rooms only after connected
      newSocket.emit("joinRooms", {
        userId: user.id,
        role: user.role,
        classIds: user.classIds || []
      });
    });

    // Listen for disconnection
    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    // Listen for errors
    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    // Listen for notifications
    newSocket.on("notification", (data) => {
      console.log("🔔 Received notification:", data);
      if (onNotification) onNotification(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, onNotification]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
