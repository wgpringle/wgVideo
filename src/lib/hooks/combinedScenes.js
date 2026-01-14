'use client';

import { useCallback, useEffect, useState } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { db, DEFAULT_USER_ID } from '../firebase';

export function useCombinedScenes(projectId) {
  const [combinedScenes, setCombinedScenes] = useState([]);

  useEffect(() => {
    if (!projectId) return undefined;
    const combinedRef = ref(
      db,
      `users/${DEFAULT_USER_ID}/projects/${projectId}/combinedScenes`
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
  }, [projectId]);

  const addCombinedScene = useCallback(
    async ({ note }) => {
      if (!projectId) return null;
      const combinedRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/combinedScenes`
      );
      const newRef = push(combinedRef);
      const payload = { note: note || '', createdAt: Date.now() };
      await set(newRef, payload);
      return newRef.key;
    },
    [projectId]
  );

  const deleteCombinedScene = useCallback(
    async (combinedSceneId) => {
      if (!projectId || !combinedSceneId) return;
      const targetRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/combinedScenes/${combinedSceneId}`
      );
      return remove(targetRef);
    },
    [projectId]
  );

  return { combinedScenes, addCombinedScene, deleteCombinedScene };
}
