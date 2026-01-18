'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './characters.module.css';
import { Button, Card, EmptyState, Input } from '../components/ui';
import { useAuth } from '../../lib/auth';
import { useCharacters } from '../../lib/hooks/characters';
import { useProjectSelection } from '../../lib/projectSelection';

function getDefaultName(file) {
  if (!file?.name) return 'Untitled Character';
  return file.name.replace(/\.[^/.]+$/, '');
}

export default function CharactersPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const userId = user?.uid;
  const { setSelectedProjectId } = useProjectSelection();

  const { characters, uploadCharacter, updateCharacter, deleteCharacter } =
    useCharacters(userId);

  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const selectedCharacter = useMemo(
    () => characters.find((item) => item.id === selectedCharacterId) || null,
    [characters, selectedCharacterId]
  );

  useEffect(() => {
    setSelectedProjectId(null);
  }, [setSelectedProjectId]);

  useEffect(() => {
    if (selectedCharacterId && !selectedCharacter) {
      setSelectedCharacterId(null);
    }
  }, [selectedCharacterId, selectedCharacter]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!uploadFile) {
      setErrorMessage('Choose an image file to upload.');
      return;
    }
    try {
      setIsUploading(true);
      const name = uploadName.trim() || getDefaultName(uploadFile);
      await uploadCharacter({ file: uploadFile, name });
      setUploadName('');
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = async (downloadUrl) => {
    if (!downloadUrl) return;
    try {
      await navigator.clipboard.writeText(downloadUrl);
    } catch (err) {
      setErrorMessage('Unable to copy link. Copy it manually from the preview.');
    }
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card title="Loading">
            <EmptyState message="Checking authentication..." />
          </Card>
        </main>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card title="Sign in required">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                Sign in with Google to manage characters. Your uploads are stored
                per account.
              </div>
              {authError ? (
                <div className="empty">Auth error: {authError}</div>
              ) : null}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => router.push('/login')}>Go to login</Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Characters</div>
            <div className={styles.subtitle}>
              Signed in as {user.email || user.displayName || 'your account'}.
              Upload image-based characters for your projects.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.stack}>
            <Card title="Upload Character">
              <form className={styles.uploadRow} onSubmit={handleUpload}>
                <Input
                  label="Friendly Name"
                  placeholder="Enter a character name"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
                <label className="field">
                  <span className="field__label">Character Image</span>
                  <input
                    ref={fileInputRef}
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                {errorMessage ? <div className="empty">{errorMessage}</div> : null}
                <div className={styles.uploadActions}>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  {uploadFile ? (
                    <span className={styles.meta}>{uploadFile.name}</span>
                  ) : null}
                </div>
              </form>
            </Card>

            <Card title="Saved Characters">
              {characters.length ? (
                <div className="list">
                  {characters.map((item) => (
                    <div key={item.id} className="list-item">
                      <div className={styles.listRow}>
                        {item.downloadUrl ? (
                          <img
                            className={styles.thumbnail}
                            src={item.downloadUrl}
                            alt={item.name || 'Character thumbnail'}
                          />
                        ) : (
                          <div className={styles.thumbnailPlaceholder} />
                        )}
                        <div className={styles.listDetails}>
                          <input
                            className="input"
                            value={item.name || ''}
                            onChange={(e) =>
                              updateCharacter(item.id, { name: e.target.value })
                            }
                          />
                          <div className="list-item__subtitle">
                            {item.updatedAt
                              ? `Updated ${new Date(item.updatedAt).toLocaleString()}`
                              : 'No updates yet'}
                          </div>
                        </div>
                      </div>
                      <div className="card__actions">
                        {item.downloadUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleCopyLink(item.downloadUrl)}
                          >
                            Copy Link
                          </Button>
                        ) : null}
                        <a
                          className="btn btn--ghost btn--sm"
                          href="#character-preview"
                          onClick={() => setSelectedCharacterId(item.id)}
                        >
                          View
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteCharacter(item);
                            if (selectedCharacterId === item.id) {
                              setSelectedCharacterId(null);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No characters uploaded yet." />
              )}
            </Card>
          </div>

          <div className={styles.stack} id="character-preview">
            <Card title="Character Preview">
              {selectedCharacter ? (
                <div className={styles.stack}>
                  <div className={styles.previewFrame}>
                    <img
                      className={styles.previewImage}
                      src={selectedCharacter.downloadUrl}
                      alt={selectedCharacter.name || 'Character preview'}
                    />
                  </div>
                  <div className={styles.meta}>
                    {selectedCharacter.name || 'Untitled Character'}
                  </div>
                </div>
              ) : (
                <EmptyState message="Select a character to preview." />
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
