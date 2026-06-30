import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAmJI5GsKJcS1UH5gFvPgK_7zQWd-sfvwY",
  authDomain: "dx-wig.firebaseapp.com",
  projectId: "dx-wig",
  storageBucket: "dx-wig.firebasestorage.app",
  messagingSenderId: "948885142013",
  appId: "1:948885142013:web:90b9f0b11a3c180adb8194",
  measurementId: "G-HFYQ2PYCP1"
};

// Initialize Firebase (safeguard for hot-reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally (since SSR environment doesn't have window/document objects)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
