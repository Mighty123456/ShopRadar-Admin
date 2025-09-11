import { io, Socket } from 'socket.io-client';

interface Activity {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'warning' | 'error';
  createdAt: string;
  timeAgo: string;
  user?: any;
  shop?: any;
  admin?: any;
  metadata?: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const API_BASE_URL = 'https://shopradarbackend.onrender.com';
    
    this.socket = io(API_BASE_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.attemptReconnect();
    });

    this.socket.on('new_activity', (activity: Activity) => {
      console.log('New activity received:', activity);
      this.handleNewActivity(activity);
    });

    this.socket.on('activity_update', (data: { type: string; data: Activity }) => {
      console.log('Activity update received:', data);
      this.handleActivityUpdate(data);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification);
      this.handleNotification(notification);
    });

    this.socket.on('connected', (data: any) => {
      console.log('WebSocket connection confirmed:', data);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, this.reconnectInterval);
  }

  private handleNewActivity(activity: Activity) {
    // Dispatch custom event for activity updates
    const event = new CustomEvent('websocket-activity', {
      detail: { activity, type: 'new_activity' }
    });
    window.dispatchEvent(event);
  }

  private handleActivityUpdate(data: { type: string; data: Activity }) {
    // Dispatch custom event for activity updates
    const event = new CustomEvent('websocket-activity', {
      detail: { activity: data.data, type: 'activity_update', activityType: data.type }
    });
    window.dispatchEvent(event);
  }

  private handleNotification(notification: Notification) {
    // Dispatch custom event for notifications
    const event = new CustomEvent('websocket-notification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  // Join specific room for activity types
  joinRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomName);
    }
  }

  // Leave specific room
  leaveRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomName);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: this.socket
    };
  }

  // Subscribe to activity updates
  subscribeToActivities(callback: (activity: Activity, type: string) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail.activity, event.detail.type);
    };
    
    window.addEventListener('websocket-activity', handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('websocket-activity', handler as EventListener);
    };
  }

  // Subscribe to notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener('websocket-notification', handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('websocket-notification', handler as EventListener);
    };
  }
}

export default new WebSocketService();
