import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from "../services/notificationApi";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications on mount
  useEffect(() => {
    const getNotifications = async () => {
      try {
        const res = await fetchNotifications(); // backend uses JWT to identify user
        const formatted = res.data.map(nr => ({
          id: nr._id, // NotificationRecipient ID
          title: nr.notification?.title || "No title",
          desc: nr.notification?.message || "No message",
          unread: !nr.isRead,
          time: new Date(nr.createdAt).toLocaleString(),
          icon: '🔔',
          color: 'text-purple-600 bg-purple-50'
        }));
        setNotifications(formatted);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    getNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id); // backend only needs notificationRecipientId
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, unread: false } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      for (const n of notifications) {
        if (n.unread) await markNotificationRead(n.id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Red Dot */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                Notifications 
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 flex gap-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group ${n.unread ? 'bg-purple-50/20' : ''}`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm ${n.color}`}>
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm font-bold truncate ${n.unread ? 'text-gray-900' : 'text-gray-500'}`}>
                          {n.title}
                        </p>
                        {n.unread && <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5 shrink-0"></div>}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-1.5">
                        {n.desc}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">{n.time}</span>
                    </div>

                    {/* Hover Action */}
                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.unread && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="p-1.5 bg-white border border-gray-100 rounded-lg text-purple-600 hover:bg-purple-600 hover:text-white shadow-md transition-all active:scale-95"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center text-gray-400">
                  <Bell size={40} className="mx-auto mb-3 opacity-10" />
                  <p className="text-xs font-medium uppercase tracking-widest">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
      `}} />
    </div>
  );
};

export default NotificationDropdown;
