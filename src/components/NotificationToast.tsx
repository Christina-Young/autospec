import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { onNotification, Notification, NotificationType } from "../utils/notifications";

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      setNotifications((prev) => [...prev, notification]);

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, notification.duration);
      }
    });

    return unsubscribe;
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(
            notification.type
          )} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-start gap-3`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

