'use client';

import { useCallback, useEffect, useState } from 'react';
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

export function useCombinedScenes(userId, projectId) {
  const [combinedScenes, setCombinedScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) {
      setCombinedScenes([]);
      return undefined;
    }
    const combinedRef = collection(
      db,
      'users',
      userId,
      'projects',
      projectId,
      'combinedScenes'
    );
    const combinedQuery = query(combinedRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(combinedQuery, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCombinedScenes(list);
    });
    return () => {
      unsubscribe();
      setCombinedScenes([]);
    };
  }, [userId, projectId]);

  const addCombinedScene = useCallback(
    async ({ note }) => {
      if (!userId || !projectId) return null;
      const combinedRef = collection(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'combinedScenes'
      );
      const payload = { note: note || '', createdAt: Date.now() };
      const newDoc = await addDoc(combinedRef, payload);
      return newDoc.id;
    },
    [userId, projectId]
  );

  const deleteCombinedScene = useCallback(
    async (combinedSceneId) => {
      if (!userId || !projectId || !combinedSceneId) return null;
      const targetRef = doc(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'combinedScenes',
        combinedSceneId
      );
      return deleteDoc(targetRef);
    },
    [userId, projectId]
  );

  return { combinedScenes, addCombinedScene, deleteCombinedScene };
}
