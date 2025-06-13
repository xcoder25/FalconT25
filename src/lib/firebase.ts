
// In a real application, this file would initialize Firebase with your project's config.
// For this prototype, we'll mock the necessary parts.

// Mock Firebase App object (enough for type checking)
interface FirebaseApp {
  name: string;
  options: object;
}

// Mock Auth object
interface Auth {
  // Add methods that might be type-checked, e.g., onAuthStateChanged
}

// Mock User object
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Add other properties your app might use
}

// Mock GoogleAuthProvider
class GoogleAuthProvider {
  // Mock methods if needed, e.g., addScope
  static PROVIDER_ID = 'google.com'; // Typical provider ID
}

// Mock signInWithPopup function
const signInWithPopup = async (auth: Auth, provider: GoogleAuthProvider): Promise<{ user: User }> => {
  console.log('Simulating signInWithPopup with Google');
  // Simulate a successful sign-in
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    user: {
      uid: 'mockGoogleUserId123',
      email: 'mock.google.user@example.com',
      displayName: 'Mock Google User',
      photoURL: 'https://placehold.co/100x100.png?text=GU',
    },
  };
};

// Mock getAuth function
const getAuth = (app?: FirebaseApp): Auth => {
  console.log('Mock getAuth called');
  return {}; // Return a mock Auth object
};

// Mock initializeApp function
const initializeApp = (config: object): FirebaseApp => {
  console.log('Mock Firebase app initialized with config:', config);
  return { name: '[DEFAULT]', options: config };
};

// Mock Firebase config (replace with your actual config in a real app)
const firebaseConfig = {
  apiKey: "MOCK_API_KEY",
  authDomain: "MOCK_AUTH_DOMAIN",
  projectId: "MOCK_PROJECT_ID",
  storageBucket: "MOCK_STORAGE_BUCKET",
  messagingSenderId: "MOCK_MESSAGING_SENDER_ID",
  appId: "MOCK_APP_ID",
};

// Initialize Firebase (mocked)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, GoogleAuthProvider, signInWithPopup };
