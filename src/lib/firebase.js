'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDCVz0eG-Y78T5a7rQI4ko_EMHl7P1pl6M',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'wgvideo-4709b.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'wgvideo-4709b',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:945029037864:web:533d80ecf29d8f1bf49a1d',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-G9RQVEDQ7L',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
export const DEFAULT_USER_ID = '1111';
