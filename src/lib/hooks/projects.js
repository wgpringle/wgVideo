'use client';

import { useCallback, useEffect, useState } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db, DEFAULT_USER_ID } from '../firebase';

export function useProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsRef = ref(db, `users/${DEFAULT_USER_ID}/projects`);
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
      }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setProjects(list);
    });

    return () => unsubscribe();
  }, []);

  const addProject = useCallback(async (project) => {
    const projectsRef = ref(db, `users/${DEFAULT_USER_ID}/projects`);
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
  }, []);

  const updateProject = useCallback(async (projectId, updates) => {
    const projectRef = ref(
      db,
      `users/${DEFAULT_USER_ID}/projects/${projectId}`
    );
    return update(projectRef, updates);
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const projectRef = ref(
      db,
      `users/${DEFAULT_USER_ID}/projects/${projectId}`
    );
    return remove(projectRef);
  }, []);

  return { projects, addProject, updateProject, deleteProject };
}
