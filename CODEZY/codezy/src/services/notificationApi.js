import axios from "./axiosInstance";

export const fetchNotifications = () =>
  axios.get("/notifications");

export const markNotificationRead = (id) =>
  axios.patch(`/notifications/${id}/read`);
