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
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

function buildStoragePath(userId, fileName) {
  const sanitizedName = fileName.replace(/\s+/g, '-');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `users/${userId}/characters/${Date.now()}-${suffix}-${sanitizedName}`;
}

export function useCharacters(userId) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    if (!userId) {
      setCharacters([]);
      return undefined;
    }

    const charactersRef = collection(db, 'users', userId, 'characters');
    const charactersQuery = query(charactersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(charactersQuery, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCharacters(list);
    });

    return () => {
      unsubscribe();
      setCharacters([]);
    };
  }, [userId]);

  const uploadCharacter = useCallback(
    async ({ file, name }) => {
      if (!userId || !file) return null;
      const storagePath = buildStoragePath(userId, file.name);
      const fileRef = ref(storage, storagePath);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(fileRef);
      const payload = {
        name: name || file.name,
        downloadUrl,
        storagePath,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const charactersRef = collection(db, 'users', userId, 'characters');
      const newDoc = await addDoc(charactersRef, payload);
      return newDoc.id;
    },
    [userId]
  );

  const updateCharacter = useCallback(
    async (characterId, updates) => {
      if (!userId || !characterId) return null;
      const characterRef = doc(db, 'users', userId, 'characters', characterId);
      return updateDoc(characterRef, { ...updates, updatedAt: Date.now() });
    },
    [userId]
  );

  const deleteCharacter = useCallback(
    async (character) => {
      if (!userId || !character?.id) return null;
      if (character.storagePath) {
        const fileRef = ref(storage, character.storagePath);
        await deleteObject(fileRef);
      }
      const characterRef = doc(db, 'users', userId, 'characters', character.id);
      return deleteDoc(characterRef);
    },
    [userId]
  );

  return { characters, uploadCharacter, updateCharacter, deleteCharacter };
}
