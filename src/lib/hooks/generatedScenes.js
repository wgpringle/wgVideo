'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { db } from '../firebase';

export function useGeneratedScenes(userId, projectId) {
  const [generatedScenes, setGeneratedScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) {
      setGeneratedScenes([]);
      return undefined;
    }
    const generatedRef = ref(
      db,
      `users/${userId}/projects/${projectId}/generatedScenes`
    );
    const unsubscribe = onValue(generatedRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
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
      const generatedRef = ref(
        db,
        `users/${userId}/projects/${projectId}/generatedScenes`
      );
      const newRef = push(generatedRef);
      const data = {
        name: payload.name || `Scene ${nextGeneratedNumber}`,
        note: payload.note || '',
        createdAt: Date.now(),
      };
      await set(newRef, data);
      return newRef.key;
    },
    [userId, projectId, nextGeneratedNumber]
  );

  const deleteGeneratedScene = useCallback(
    async (generatedSceneId) => {
      if (!userId || !projectId || !generatedSceneId) return null;
      const targetRef = ref(
        db,
        `users/${userId}/projects/${projectId}/generatedScenes/${generatedSceneId}`
      );
      return remove(targetRef);
    },
    [userId, projectId]
  );

  return { generatedScenes, addGeneratedScene, deleteGeneratedScene };
}
