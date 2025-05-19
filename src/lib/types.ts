
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string; // Added for login/staff management
}

export interface Recognition {
  id: string;
  giver: User;
  receiver: User;
  value?: string; // e.g., "Teamwork", "Innovation"
  reason: string;
  message?: string;
  timestamp: string; // ISO date string
  reactions: Reaction[];
  comments: Comment[];
}

export interface Reaction {
  id: string;
  user: User; // Changed from userId to User object
  emoji: string; 
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string; // ISO date string
}

export interface RecognitionValue {
  id: string;
  name: string;
  description?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  status: 'recognized' | 'unknown' | 'active';
  department?: string; // Optional
}

export interface SignInSignOutRecord {
  id:string;
  staffMemberId: string;
  staffName: string; // For easier display
  timestamp: string; // ISO date string
  type: 'signin' | 'signout';
  camera: string; // Camera name or ID
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  status: 'online' | 'offline' | 'connecting';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success' | 'recognition';
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean; // Optional: for highlighting active link
  children?: NavigationItem[]; // For nested menus like Settings
}
