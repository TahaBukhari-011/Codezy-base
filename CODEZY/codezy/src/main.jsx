import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; 
import { SocketProvider } from "./context/socketContext.jsx";
import { getCurrentUser } from "./services/auth.js";
const user = getCurrentUser();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider
          user={user}
          onNotification={(data) => {
            if (!data.persistent) toast(data.message); 
            addNotificationToDashboard(data);
          }}
        >
          <App />
        </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
