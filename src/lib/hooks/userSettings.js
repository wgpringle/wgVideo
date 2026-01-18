'use client';

import { useCallback, useEffect, useState } from 'react';
import { deleteUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

async function deleteCollectionDocs(collectionRef) {
  const snapshot = await getDocs(collectionRef);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
}

export function useUserSettings(userId) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSettings(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setSettings(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Failed to load settings');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const saveKlingKey = useCallback(
    async ({ accessKey, secretKey }) => {
      if (!userId || !accessKey || !secretKey) return null;
      const userRef = doc(db, 'users', userId);
      setError(null);
      return setDoc(
        userRef,
        {
          apiKeys: {
            kling: {
              accessKey,
              secretKey,
            },
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    },
    [userId]
  );

  const deleteKlingKey = useCallback(async () => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    setError(null);
    return setDoc(
      userRef,
      {
        apiKeys: {
          kling: deleteField(),
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }, [userId]);

  const deleteAccount = useCallback(async () => {
    if (!userId) return null;
    setError(null);
    const charactersRef = collection(db, 'users', userId, 'characters');
    const charactersSnap = await getDocs(charactersRef);
    for (const docSnap of charactersSnap.docs) {
      const data = docSnap.data();
      if (data.storagePath) {
        try {
          await deleteObject(ref(storage, data.storagePath));
        } catch (err) {
          if (err?.code !== 'storage/object-not-found') {
            throw err;
          }
        }
      }
      await deleteDoc(docSnap.ref);
    }

    const projectsRef = collection(db, 'users', userId, 'projects');
    const projectsSnap = await getDocs(projectsRef);
    for (const projectSnap of projectsSnap.docs) {
      const projectId = projectSnap.id;
      const basePath = ['users', userId, 'projects', projectId];
      await deleteCollectionDocs(collection(db, ...basePath, 'scenes'));
      await deleteCollectionDocs(collection(db, ...basePath, 'generatedScenes'));
      await deleteCollectionDocs(collection(db, ...basePath, 'combinedScenes'));
      await deleteDoc(projectSnap.ref);
    }

    await deleteDoc(doc(db, 'users', userId));

    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }

    return true;
  }, [userId]);

  return {
    settings,
    loading,
    error,
    saveKlingKey,
    deleteKlingKey,
    deleteAccount,
  };
}
