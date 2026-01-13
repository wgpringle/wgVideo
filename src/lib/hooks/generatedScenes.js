'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useGeneratedScenes(userId, projectId) {
  const [generatedScenes, setGeneratedScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) return undefined;
    const generatedRef = collection(
      db,
      `users/${userId}/projects/${projectId}/generatedScenes`
    );
    const q = query(generatedRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGeneratedScenes(list);
    });
    return () => {
      unsubscribe();
      setGeneratedScenes([]);
    };
  }, [userId, projectId]);

  const nextGeneratedNumber = useMemo(
    () => generatedScenes.length + 1,
    [generatedScenes.length]
  );

  const addGeneratedScene = useCallback(
    async (payload = {}) => {
      if (!userId || !projectId) return null;
      const generatedRef = collection(
        db,
        `users/${userId}/projects/${projectId}/generatedScenes`
      );
      const data = {
        name: payload.name || `Scene ${nextGeneratedNumber}`,
        note: payload.note || '',
        createdAt: Date.now(),
      };
      const docRef = await addDoc(generatedRef, data);
      return docRef.id;
    },
    [userId, projectId, nextGeneratedNumber]
  );

  const deleteGeneratedScene = useCallback(
    async (generatedSceneId) => {
      if (!userId || !projectId || !generatedSceneId) return;
      const targetRef = doc(
        db,
        `users/${userId}/projects/${projectId}/generatedScenes/${generatedSceneId}`
      );
      return deleteDoc(targetRef);
    },
    [userId, projectId]
  );

  return { generatedScenes, addGeneratedScene, deleteGeneratedScene };
}
