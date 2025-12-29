import axios from "../lib/axios";

export const NotificationService = {
  getNotifications: async () => {
    const response = await axios.get("/notifications/");
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await axios.get("/notifications/unread-count");
    return response.data;
  },
  markAllasRead: async () => {
    const response = await axios.patch("/notifications/mark-all-read");
    return response.data;
  },
  markOneasRead: async (_id) => {
    const response = await axios.patch(`/notifications/${_id}`);
    return response.data;
  },
};
