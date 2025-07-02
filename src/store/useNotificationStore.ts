import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'maintenance' | 'warning' | 'news' | 'info' | 'success' | 'update';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  // For future API integration
  fetchNotifications: () => Promise<void>;
}

// Mock notifications data - replace with API call when ready
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tomorrow at 2:00 AM. Expected downtime: 30 minutes.',
    timestamp: '2024-01-15T10:00:00Z',
    priority: 'medium',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'High CPU Usage',
    message: 'VM "web-server-01" is experiencing high CPU usage (85%). Consider scaling up.',
    timestamp: '2024-01-15T09:30:00Z',
    priority: 'high',
    read: false
  },
  {
    id: '3',
    type: 'news',
    title: 'New Features Available',
    message: 'Enhanced monitoring dashboard and automated backup features are now available.',
    timestamp: '2024-01-15T08:00:00Z',
    priority: 'low',
    read: false
  },
  {
    id: '4',
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily backup completed successfully. All data is secure and up to date.',
    timestamp: '2024-01-15T06:00:00Z',
    priority: 'low',
    read: true
  },
  {
    id: '5',
    type: 'update',
    title: 'Security Update',
    message: 'Critical security patches have been applied to your infrastructure.',
    timestamp: '2024-01-15T05:00:00Z',
    priority: 'critical',
    read: false
  }
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: mockNotifications,
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    )
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({ ...notification, read: true }))
  })),
  
  clearAll: () => set({ notifications: [] }),
  
  fetchNotifications: async () => {
    // TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await axios.get('/api/notifications');
    //   set({ notifications: response.data });
    // } catch (error) {
    //   console.error('Failed to fetch notifications:', error);
    // }
    
    // For now, just use mock data
    set({ notifications: mockNotifications });
  }
})); 