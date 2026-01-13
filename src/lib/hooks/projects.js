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
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!userId) return undefined;
    const projectsRef = collection(db, `users/${userId}/projects`);
    const q = query(projectsRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setProjects(list);
    });

    return () => unsubscribe();
  }, [userId]);

  const addProject = useCallback(async (project) => {
    if (!userId) return null;
    const projectsRef = collection(db, `users/${userId}/projects`);
    const payload = {
      name: project.name || 'Untitled Project',
      cameraRules: project.cameraRules || '',
      videoStyleNotes: project.videoStyleNotes || '',
      characterId: project.characterId || '',
      createdAt: Date.now(),
    };
    const docRef = await addDoc(projectsRef, payload);
    return docRef.id;
  }, [userId]);

  const updateProject = useCallback(async (projectId, updates) => {
    if (!userId) return null;
    const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
    return updateDoc(projectRef, updates);
  }, [userId]);

  const deleteProject = useCallback(async (projectId) => {
    if (!userId) return null;
    const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
    return deleteDoc(projectRef);
  }, [userId]);

  return { projects, addProject, updateProject, deleteProject };
}
