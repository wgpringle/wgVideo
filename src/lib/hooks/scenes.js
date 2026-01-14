'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';

export function useScenes(userId, projectId) {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) {
      setScenes([]);
      return undefined;
    }
    const scenesRef = ref(db, `users/${userId}/projects/${projectId}/scenes`);
    const unsubscribe = onValue(scenesRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
      }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setScenes(list);
    });
    return () => {
      unsubscribe();
      setScenes([]);
    };
  }, [userId, projectId]);

  const nextSceneNumber = useMemo(() => scenes.length + 1, [scenes.length]);

  const addScene = useCallback(
    async (name) => {
      if (!userId || !projectId) return null;
      const scenesRef = ref(db, `users/${userId}/projects/${projectId}/scenes`);
      const newRef = push(scenesRef);
      const payload = {
        name: name || `Scene ${nextSceneNumber}`,
        enabled: true,
        order: scenes.length,
        createdAt: Date.now(),
      };
      await set(newRef, payload);
      return newRef.key;
    },
    [userId, projectId, nextSceneNumber, scenes.length]
  );

  const updateScene = useCallback(
    async (sceneId, updates) => {
      if (!userId || !projectId || !sceneId) return null;
      const sceneRef = ref(
        db,
        `users/${userId}/projects/${projectId}/scenes/${sceneId}`
      );
      return update(sceneRef, updates);
    },
    [userId, projectId]
  );

  const deleteScene = useCallback(
    async (sceneId) => {
      if (!userId || !projectId || !sceneId) return null;
      const sceneRef = ref(
        db,
        `users/${userId}/projects/${projectId}/scenes/${sceneId}`
      );
      return remove(sceneRef);
    },
    [userId, projectId]
  );

  const reorderScenes = useCallback(
    async (orderedIds) => {
      if (!userId || !projectId || !orderedIds?.length) return null;
      const updates = {};
      orderedIds.forEach((sceneId, index) => {
        updates[`${sceneId}/order`] = index;
      });
      const scenesRef = ref(db, `users/${userId}/projects/${projectId}/scenes`);
      return update(scenesRef, updates);
    },
    [userId, projectId]
  );

  return {
    scenes,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    nextSceneNumber,
  };
}
