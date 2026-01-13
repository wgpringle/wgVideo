"use client";

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const {
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} = process.env;

if (
  !NEXT_PUBLIC_FIREBASE_API_KEY ||
  !NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  !NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !NEXT_PUBLIC_FIREBASE_APP_ID
) {
  throw new Error(
    "Missing Firebase environment variables. Check your .env.local file."
  );
}

const firebaseConfig = {
  apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
export const DEFAULT_USER_ID = "1111";
