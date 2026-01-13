'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        setError(err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
