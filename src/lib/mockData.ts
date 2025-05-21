
import type { User, Recognition, RecognitionValue, StaffMember, SignInSignOutRecord, Camera, AppNotification, AuditLogEntry } from './types';

// Ensure some User IDs overlap with StaffMember IDs for linking recognitions
export const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png?text=AW', email: 'alice@example.com' }, // Giver
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png?text=BB', email: 'bob@example.com' },   // Giver
  { id: 'user3', name: 'Charlie Chaplin', avatarUrl: 'https://placehold.co/100x100.png?text=CC', email: 'charlie@example.com' }, // Giver
  { id: 'user4', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100.png?text=DP', email: 'diana@example.com' },   // Giver
  // Add users that correspond to staff members to be receivers
  { id: 'staff1', name: 'Eve Adamson', avatarUrl: 'https://placehold.co/100x100.png?text=EA', email: 'eve@example.com' },
  { id: 'staff3', name: 'Grace Hopper', avatarUrl: 'https://placehold.co/100x100.png?text=GH', email: 'grace@example.com' },
  { id: 'staff4', name: 'Harry Potter', avatarUrl: 'https://placehold.co/100x100.png?text=HP', email: 'harry@example.com' },
  { id: 'adminUser', name: 'Admin User', avatarUrl: 'https://placehold.co/100x100.png?text=AU', email: 'xcoder2442@gmail.com' }
];


export const mockStaffMembers: StaffMember[] = [
  { id: 'staff1', name: 'Eve Adamson', email: 'eve@example.com', imageUrl: 'https://placehold.co/150x150.png?text=EA', status: 'recognized', department: 'Engineering' },
  { id: 'staff2', name: 'Frankenstein Monster', email: 'frank@example.com', imageUrl: 'https://placehold.co/150x150.png?text=FM', status: 'unknown', department: 'Research' },
  { id: 'staff3', name: 'Grace Hopper', email: 'grace@example.com', imageUrl: 'https://placehold.co/150x150.png?text=GH', status: 'active', department: 'Development' },
  { id: 'staff4', name: 'Harry Potter', email: 'harry@example.com', imageUrl: 'https://placehold.co/150x150.png?text=HP', status: 'recognized', department: 'Magic' },
];

export const mockRecognitionValues: RecognitionValue[] = [
  { id: 'val1', name: 'Team Player', description: 'Consistently helps colleagues and fosters a collaborative environment.' },
  { id: 'val2', name: 'Innovation', description: 'Brings new ideas and creative solutions to challenges.' },
  { id: 'val3', name: 'Customer Focus', description: 'Goes above and beyond to ensure customer satisfaction.' },
  { id: 'val4', name: 'Problem Solver', description: 'Effectively identifies and resolves complex issues.' },
  { id: 'val5', name: 'Leadership', description: 'Inspires and guides others towards success.' },
];

// Find user objects from mockUsers to use as receivers, matching staffMember IDs
const eveAdamsonUser = mockUsers.find(u => u.id === 'staff1')!;
const graceHopperUser = mockUsers.find(u => u.id === 'staff3')!;
const harryPotterUser = mockUsers.find(u => u.id === 'staff4')!;

export let mockRecognitions: Recognition[] = [ // Changed to let for potential dynamic updates if needed
  {
    id: 'rec1',
    giver: mockUsers[0], // Alice
    receiver: eveAdamsonUser, // Eve Adamson (staff1)
    value: 'Team Player',
    reason: 'Eve was incredibly helpful in onboarding the new intern, showing great patience and guidance, and ensuring they felt welcome and productive from day one.',
    message: 'Thanks for being such a great team player, Eve! Your help with the new intern was invaluable.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    reactions: [{ id: 'r1', user: mockUsers[2], emoji: '👍' }, { id: 'r2', user: mockUsers[3], emoji: '🎉' }],
    comments: [
      { id: 'c1', user: mockUsers[2], text: 'Well deserved, Eve!', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
    ],
  },
  {
    id: 'rec2',
    giver: mockUsers[2], // Charlie
    receiver: graceHopperUser, // Grace Hopper (staff3)
    value: 'Innovation',
    reason: 'Grace developed a new script that automated a tedious daily task, saving the team approximately 5 hours each week and reducing manual errors.',
    message: 'Grace, your innovative script is a game-changer! Amazing work.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    reactions: [{ id: 'r3', user: mockUsers[1], emoji: '💡' }],
    comments: [],
  },
  {
    id: 'rec3',
    giver: mockUsers[3], // Diana
    receiver: harryPotterUser, // Harry Potter (staff4)
    value: 'Customer Focus',
    reason: 'Harry handled a very difficult customer complaint with exceptional professionalism and empathy, ultimately resolving the issue to the customer\'s satisfaction and retaining their business.',
    message: 'Harry, your dedication to customer satisfaction is inspiring. Thank you!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
    reactions: [
        { id: 'r4', user: mockUsers[0], emoji: '👏' },
        { id: 'r5', user: mockUsers[1], emoji: '🌟' }
    ],
    comments: [
      { id: 'c2', user: mockUsers[0], text: 'Great job, Harry!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
      { id: 'c3', user: mockUsers[1], text: 'So proud of you!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
    ],
  },
  {
    id: 'rec4',
    giver: mockUsers[1], // Bob
    receiver: eveAdamsonUser, // Eve Adamson (staff1)
    value: 'Problem Solver',
    reason: 'Eve quickly identified a critical bug in the latest deployment and worked tirelessly to implement a fix before it impacted major clients.',
    message: 'Eve, your problem-solving skills saved the day! Thank you for your quick action.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    reactions: [{ id: 'r6', user: mockUsers[3], emoji: '🛠️' }],
    comments: [],
  },
   {
    id: 'rec5',
    giver: mockUsers[0], // Alice
    receiver: graceHopperUser, // Grace Hopper (staff3)
    value: 'Leadership',
    reason: 'Grace took the lead on the recent Falcon project, coordinating efforts across multiple teams and ensuring everyone was aligned and motivated, leading to an early completion.',
    message: 'Exceptional leadership on the Falcon project, Grace. You were instrumental to its success!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    reactions: [{ id: 'r7', user: mockUsers[1], emoji: '🏆' }],
    comments: [],
  }
];


// Changed to let to allow modification for real-time simulation
export let mockSignInSignOutHistory: SignInSignOutRecord[] = [
  { id: 'hist1', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), type: 'signin', camera: 'Front Entrance Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA' },
  { id: 'hist_unrec1', staffMemberId: 'unrecognized_001', staffName: 'Unrecognized Person', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString(), type: 'sighting', camera: 'Lobby Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=Face1' },
  { id: 'hist2', staffMemberId: 'staff3', staffName: 'Grace Hopper', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), type: 'signin', camera: 'Lab Cam 1', snapshotImageUrl: 'https://placehold.co/80x80.png?text=GH' },
  { id: 'hist1_out', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), type: 'signout', camera: 'Front Entrance Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA' },
  { id: 'hist4', staffMemberId: 'staff4', staffName: 'Harry Potter', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'signin', camera: 'Meeting Room A', snapshotImageUrl: 'https://placehold.co/80x80.png?text=HP' },
  { id: 'hist3_out', staffMemberId: 'staff3', staffName: 'Grace Hopper', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), type: 'signout', camera: 'Lab Cam 1', snapshotImageUrl: 'https://placehold.co/80x80.png?text=GH' },
  // Add more entries for variety
  { id: 'hist5', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30).toISOString(), type: 'signin', camera: 'Main Office Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA2' }, // Yesterday
  { id: 'hist6', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 8).toISOString(), type: 'signout', camera: 'Main Office Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA3' }, // Yesterday
  { id: 'hist7', staffMemberId: 'staff3', staffName: 'Grace Hopper', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 15).toISOString(), type: 'signin', camera: 'Lab Cam 2', snapshotImageUrl: 'https://placehold.co/80x80.png?text=GH2' }, // Yesterday
  { id: 'hist8', staffMemberId: 'staff3', staffName: 'Grace Hopper', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 9).toISOString(), type: 'signout', camera: 'Lab Cam 2', snapshotImageUrl: 'https://placehold.co/80x80.png?text=GH3' }, // Yesterday
  { id: 'hist_unrec2', staffMemberId: 'unrecognized_002', staffName: 'Unrecognized Person', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'sighting', camera: 'Parking Lot Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=Face2' },
];

export const mockCameras: Camera[] = [
  { id: 'cam1', name: 'Front Entrance Cam', rtspUrl: 'rtsp://example.com/cam1', status: 'online' },
  { id: 'cam2', name: 'Lab Cam 1', rtspUrl: 'rtsp://example.com/cam2', status: 'offline' },
  { id: 'cam3', name: 'Lobby Cam', rtspUrl: 'rtsp://example.com/cam3', status: 'online' },
  { id: 'cam4', name: 'Warehouse Cam', rtspUrl: 'rtsp://example.com/cam4', status: 'connecting' },
  { id: 'cam5', name: 'Meeting Room A', rtspUrl: 'rtsp://example.com/cam5', status: 'online' },
  { id: 'cam6', name: 'Main Office Cam', rtspUrl: 'rtsp://example.com/cam6', status: 'online' },
  { id: 'cam7', name: 'Lab Cam 2', rtspUrl: 'rtsp://example.com/cam7', status: 'online' },
  { id: 'cam8', name: 'Parking Lot Cam', rtspUrl: 'rtsp://example.com/cam8', status: 'online' },
];

export const mockNotifications: AppNotification[] = [
  { id: 'notif_unrec', title: 'Security Alert: Unrecognized Person', message: 'An unrecognized person was detected at Lobby Cam.', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), read: false, type: 'warning' },
  { id: 'notif1', title: 'New Recognition!', message: 'Eve Adamson received a recognition for Team Player.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, type: 'recognition' },
  { id: 'notif2', title: 'Camera Offline', message: 'Lab Cam 1 is currently offline. Please check connection.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false, type: 'warning' },
  { id: 'notif3', title: 'System Update', message: 'Applaud system will undergo maintenance tonight at 2 AM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true, type: 'info' },
];

const adminUser = mockUsers.find(u => u.id === 'adminUser')!;
const aliceUser = mockUsers.find(u => u.id === 'user1')!;

export const mockAuditLogEntries: AuditLogEntry[] = [
  {
    id: 'audit1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    action: 'USER_LOGIN',
    details: 'Admin logged in successfully.',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    action: 'STAFF_ADDED',
    details: `Staff member "Harry Potter" (ID: staff4) was added to the system.`,
    targetId: 'staff4',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    userId: aliceUser.id,
    userName: aliceUser.name,
    action: 'RECOGNITION_GIVEN',
    details: `Alice Wonderland recognized Eve Adamson for "Team Player".`,
    targetId: 'rec1',
    ipAddress: '203.0.113.45',
  },
  {
    id: 'audit4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    action: 'SETTINGS_UPDATED',
    details: 'Notification preferences for email were changed.',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    action: 'CAMERA_STATUS_CHANGED',
    details: 'Camera "Lab Cam 1" status changed to offline.',
    targetId: 'cam2',
    ipAddress: '192.168.1.100',
  },
];

// Function to add a new sign-in/out record, can be called to simulate real-time events
export function addSignInSignOutRecord(record: Omit<SignInSignOutRecord, 'id'>): SignInSignOutRecord {
  const newRecord: SignInSignOutRecord = {
    ...record,
    id: `hist${mockSignInSignOutHistory.length + 1}_${Date.now()}`,
  };
  mockSignInSignOutHistory.unshift(newRecord); // Add to the beginning for chronological order in UI
  return newRecord;
}
