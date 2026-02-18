/**
 * Simple notification system for user feedback
 * In a production app, you might want to use a toast library
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

let notificationListeners: ((notification: Notification) => void)[] = [];

export function showNotification(
  type: NotificationType,
  message: string,
  duration: number = 3000
) {
  const notification: Notification = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
    duration,
  };

  notificationListeners.forEach((listener) => listener(notification));
}

export function onNotification(listener: (notification: Notification) => void) {
  notificationListeners.push(listener);
  return () => {
    notificationListeners = notificationListeners.filter((l) => l !== listener);
  };
}

// Convenience functions
export const notify = {
  success: (message: string) => showNotification('success', message),
  error: (message: string) => showNotification('error', message),
  info: (message: string) => showNotification('info', message),
  warning: (message: string) => showNotification('warning', message),
};

