'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db, DEFAULT_USER_ID } from '../firebase';

export function useScenes(projectId) {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    if (!projectId) return undefined;
    const scenesRef = ref(
      db,
      `users/${DEFAULT_USER_ID}/projects/${projectId}/scenes`
    );
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
  }, [projectId]);

  const nextSceneNumber = useMemo(() => scenes.length + 1, [scenes.length]);

  const addScene = useCallback(
    async (name) => {
      if (!projectId) return null;
      const scenesRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/scenes`
      );
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
    [projectId, nextSceneNumber, scenes.length]
  );

  const updateScene = useCallback(
    async (sceneId, updates) => {
      if (!projectId || !sceneId) return;
      const sceneRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/scenes/${sceneId}`
      );
      return update(sceneRef, updates);
    },
    [projectId]
  );

  const deleteScene = useCallback(
    async (sceneId) => {
      if (!projectId || !sceneId) return;
      const sceneRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/scenes/${sceneId}`
      );
      return remove(sceneRef);
    },
    [projectId]
  );

  const reorderScenes = useCallback(
    async (orderedIds) => {
      if (!projectId || !orderedIds?.length) return;
      const updates = {};
      orderedIds.forEach((sceneId, index) => {
        updates[`${sceneId}/order`] = index;
      });
      const scenesRef = ref(
        db,
        `users/${DEFAULT_USER_ID}/projects/${projectId}/scenes`
      );
      return update(scenesRef, updates);
    },
    [projectId]
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
