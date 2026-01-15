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
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useScenes(userId, projectId) {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    if (!userId || !projectId) {
      setScenes([]);
      return undefined;
    }
    const scenesRef = collection(
      db,
      'users',
      userId,
      'projects',
      projectId,
      'scenes'
    );
    const scenesQuery = query(scenesRef, orderBy('order'));
    const unsubscribe = onSnapshot(scenesQuery, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
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
      const scenesRef = collection(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'scenes'
      );
      const payload = {
        name: name || `Scene ${nextSceneNumber}`,
        enabled: true,
        order: scenes.length,
        createdAt: Date.now(),
      };
      const newDoc = await addDoc(scenesRef, payload);
      return newDoc.id;
    },
    [userId, projectId, nextSceneNumber, scenes.length]
  );

  const updateScene = useCallback(
    async (sceneId, updates) => {
      if (!userId || !projectId || !sceneId) return null;
      const sceneRef = doc(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'scenes',
        sceneId
      );
      return updateDoc(sceneRef, updates);
    },
    [userId, projectId]
  );

  const deleteScene = useCallback(
    async (sceneId) => {
      if (!userId || !projectId || !sceneId) return null;
      const sceneRef = doc(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'scenes',
        sceneId
      );
      return deleteDoc(sceneRef);
    },
    [userId, projectId]
  );

  const reorderScenes = useCallback(
    async (orderedIds) => {
      if (!userId || !projectId || !orderedIds?.length) return null;
      const batch = writeBatch(db);
      orderedIds.forEach((sceneId, index) => {
        const sceneRef = doc(
          db,
          'users',
          userId,
          'projects',
          projectId,
          'scenes',
          sceneId
        );
        batch.update(sceneRef, { order: index });
      });
      return batch.commit();
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
