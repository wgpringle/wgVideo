'use client';

import { useCallback, useEffect, useState } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { db } from '../firebase';

export function useCombinedScenes(userId, projectId) {
  const [combinedScenes, setCombinedScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) {
      setCombinedScenes([]);
      return undefined;
    }
    const combinedRef = ref(
      db,
      `users/${userId}/projects/${projectId}/combinedScenes`
    );
    const unsubscribe = onValue(combinedRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
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
      const combinedRef = ref(
        db,
        `users/${userId}/projects/${projectId}/combinedScenes`
      );
      const newRef = push(combinedRef);
      const payload = { note: note || '', createdAt: Date.now() };
      await set(newRef, payload);
      return newRef.key;
    },
    [userId, projectId]
  );

  const deleteCombinedScene = useCallback(
    async (combinedSceneId) => {
      if (!userId || !projectId || !combinedSceneId) return null;
      const targetRef = ref(
        db,
        `users/${userId}/projects/${projectId}/combinedScenes/${combinedSceneId}`
      );
      return remove(targetRef);
    },
    [userId, projectId]
  );

  return { combinedScenes, addCombinedScene, deleteCombinedScene };
}
