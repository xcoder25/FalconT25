
import type { User, Recognition, RecognitionValue, StaffMember, SignInSignOutRecord, Camera, AppNotification } from './types';

export const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png?text=AW', email: 'alice@example.com' },
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png?text=BB', email: 'bob@example.com' },
  { id: 'user3', name: 'Charlie Chaplin', avatarUrl: 'https://placehold.co/100x100.png?text=CC', email: 'charlie@example.com' },
  { id: 'user4', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100.png?text=DP', email: 'diana@example.com' },
];

export const mockRecognitionValues: RecognitionValue[] = [
  { id: 'val1', name: 'Team Player', description: 'Consistently helps colleagues and fosters a collaborative environment.' },
  { id: 'val2', name: 'Innovation', description: 'Brings new ideas and creative solutions to challenges.' },
  { id: 'val3', name: 'Customer Focus', description: 'Goes above and beyond to ensure customer satisfaction.' },
  { id: 'val4', name: 'Problem Solver', description: 'Effectively identifies and resolves complex issues.' },
  { id: 'val5', name: 'Leadership', description: 'Inspires and guides others towards success.' },
];

export const mockRecognitions: Recognition[] = [
  {
    id: 'rec1',
    giver: mockUsers[0],
    receiver: mockUsers[1],
    value: 'Team Player',
    reason: 'Bob was incredibly helpful in onboarding the new intern, showing great patience and guidance.',
    message: 'Thanks for being such a great team player, Bob! Your help with the new intern was invaluable.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    reactions: [{ id: 'r1', user: mockUsers[2], emoji: '👍' }, { id: 'r2', user: mockUsers[3], emoji: '🎉' }],
    comments: [
      { id: 'c1', user: mockUsers[2], text: 'Well deserved, Bob!', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
    ],
  },
  {
    id: 'rec2',
    giver: mockUsers[2],
    receiver: mockUsers[0],
    value: 'Innovation',
    reason: 'Alice developed a new script that automated a tedious daily task, saving the team hours each week.',
    message: 'Alice, your innovative script is a game-changer! Amazing work.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    reactions: [{ id: 'r3', user: mockUsers[1], emoji: '💡' }],
    comments: [],
  },
  {
    id: 'rec3',
    giver: mockUsers[3],
    receiver: mockUsers[2],
    value: 'Customer Focus',
    reason: 'Charlie handled a very difficult customer complaint with exceptional professionalism and resolved the issue.',
    message: 'Charlie, your dedication to customer satisfaction is inspiring. Thank you!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    reactions: [
        { id: 'r4', user: mockUsers[0], emoji: '👏' },
        { id: 'r5', user: mockUsers[1], emoji: '🌟' }
    ],
    comments: [
      { id: 'c2', user: mockUsers[0], text: 'Great job, Charlie!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
      { id: 'c3', user: mockUsers[1], text: 'So proud of you!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
    ],
  },
];

export const mockStaffMembers: StaffMember[] = [
  { id: 'staff1', name: 'Eve Adamson', email: 'eve@example.com', imageUrl: 'https://placehold.co/150x150.png?text=EA', status: 'recognized', department: 'Engineering' },
  { id: 'staff2', name: 'Frankenstein Monster', email: 'frank@example.com', imageUrl: 'https://placehold.co/150x150.png?text=FM', status: 'unknown', department: 'Research' }, // This one is 'unknown'
  { id: 'staff3', name: 'Grace Hopper', email: 'grace@example.com', imageUrl: 'https://placehold.co/150x150.png?text=GH', status: 'active', department: 'Development' },
  { id: 'staff4', name: 'Harry Potter', email: 'harry@example.com', imageUrl: 'https://placehold.co/150x150.png?text=HP', status: 'recognized', department: 'Magic' },
];

export const mockSignInSignOutHistory: SignInSignOutRecord[] = [
  { id: 'hist1', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'signin', camera: 'Front Entrance Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA' },
  { id: 'hist_unrec1', staffMemberId: 'unrecognized_001', staffName: 'Unrecognized Person', timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(), type: 'sighting', camera: 'Lobby Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=Face' },
  { id: 'hist2', staffMemberId: 'staff3', staffName: 'Grace Hopper', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), type: 'signin', camera: 'Lab Cam 1', snapshotImageUrl: 'https://placehold.co/80x80.png?text=GH' },
  { id: 'hist3', staffMemberId: 'staff1', staffName: 'Eve Adamson', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'signout', camera: 'Front Entrance Cam', snapshotImageUrl: 'https://placehold.co/80x80.png?text=EA' },
  { id: 'hist4', staffMemberId: 'staff4', staffName: 'Harry Potter', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'signin', camera: 'Meeting Room A', snapshotImageUrl: 'https://placehold.co/80x80.png?text=HP' },
];

export const mockCameras: Camera[] = [
  { id: 'cam1', name: 'Front Entrance Cam', rtspUrl: 'rtsp://example.com/cam1', status: 'online' },
  { id: 'cam2', name: 'Lab Cam 1', rtspUrl: 'rtsp://example.com/cam2', status: 'offline' },
  { id: 'cam3', name: 'Lobby Cam', rtspUrl: 'rtsp://example.com/cam3', status: 'online' },
  { id: 'cam4', name: 'Warehouse Cam', rtspUrl: 'rtsp://example.com/cam4', status: 'connecting' },
  { id: 'cam5', name: 'Meeting Room A', rtspUrl: 'rtsp://example.com/cam5', status: 'online' },
];

export const mockNotifications: AppNotification[] = [
  { id: 'notif_unrec', title: 'Security Alert: Unrecognized Person', message: 'An unrecognized person was detected at Lobby Cam.', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), read: false, type: 'warning' },
  { id: 'notif1', title: 'New Recognition!', message: 'Bob The Builder received a recognition for Team Player.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, type: 'recognition' },
  { id: 'notif2', title: 'Camera Offline', message: 'Lab Cam 1 is currently offline. Please check connection.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false, type: 'warning' },
  { id: 'notif3', title: 'System Update', message: 'Applaud system will undergo maintenance tonight at 2 AM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true, type: 'info' },
];

