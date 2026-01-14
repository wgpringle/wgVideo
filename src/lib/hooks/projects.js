'use client';

import { useCallback, useEffect, useState } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      return undefined;
    }

    const projectsRef = ref(db, `users/${userId}/projects`);
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setProjects(list);
    });

    return () => {
      unsubscribe();
      setProjects([]);
    };
  }, [userId]);

  const addProject = useCallback(
    async (project) => {
      if (!userId) return null;
      const projectsRef = ref(db, `users/${userId}/projects`);
      const newRef = push(projectsRef);
      const payload = {
        name: project.name || 'Untitled Project',
        cameraRules: project.cameraRules || '',
        videoStyleNotes: project.videoStyleNotes || '',
        characterId: project.characterId || '',
        createdAt: Date.now(),
      };
      await set(newRef, payload);
      return newRef.key;
    },
    [userId]
  );

  const updateProject = useCallback(
    async (projectId, updates) => {
      if (!userId || !projectId) return null;
      const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
      return update(projectRef, updates);
    },
    [userId]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      if (!userId || !projectId) return null;
      const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
      return remove(projectRef);
    },
    [userId]
  );

  return { projects, addProject, updateProject, deleteProject };
}
