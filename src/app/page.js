"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import {
  Card,
  Button,
  Input,
  Textarea,
  Toggle,
  RadioItem,
  EmptyState,
  Select,
} from "./components/ui";
import { DraggableList } from "./components/DraggableList";
import { useProjects } from "../lib/hooks/projects";
import { useScenes } from "../lib/hooks/scenes";
import { useGeneratedScenes } from "../lib/hooks/generatedScenes";
import { useCombinedScenes } from "../lib/hooks/combinedScenes";
import { useCharacters } from "../lib/hooks/characters";
import { useAuth } from "../lib/auth";
import { useProjectSelection } from "../lib/projectSelection";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const userId = user?.uid;

  const { projects, addProject, updateProject, deleteProject } = useProjects(userId);
  const { selectedProjectId, setSelectedProjectId } = useProjectSelection();
  const [selectedGeneratedId, setSelectedGeneratedId] = useState(null);
  const { characters } = useCharacters(userId);

  const {
    scenes,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    nextSceneNumber,
  } = useScenes(userId, selectedProjectId);
  const {
    generatedScenes,
    addGeneratedScene,
    deleteGeneratedScene,
  } = useGeneratedScenes(userId, selectedProjectId);
  const { combinedScenes, addCombinedScene, deleteCombinedScene } =
    useCombinedScenes(userId, selectedProjectId);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const characterOptions = useMemo(
    () => [
      { value: "", label: "No character" },
      ...characters.map((character) => ({
        value: character.id,
        label: character.name || "Untitled Character",
      })),
    ],
    [characters]
  );
  const durationOptions = useMemo(
    () => [
      { value: "5", label: "5 seconds" },
      { value: "10", label: "10 seconds" },
    ],
    []
  );

  const emptyForm = useMemo(
    () => ({
      name: "",
      cameraRules: "",
      videoStyleNotes: "",
    }),
    []
  );

  const [projectForm, setProjectForm] = useState(emptyForm);
  const prevSelectedProjectRef = useRef(selectedProjectId);

  useEffect(() => {
    if (!userId) {
      setSelectedProjectId(null);
      setSelectedGeneratedId(null);
      setProjectForm(emptyForm);
    }
  }, [userId, emptyForm, setSelectedProjectId]);

  useEffect(() => {
    if (prevSelectedProjectRef.current === selectedProjectId) {
      return;
    }
    prevSelectedProjectRef.current = selectedProjectId;
    if (!selectedProjectId) {
      setProjectForm(emptyForm);
      setSelectedGeneratedId(null);
      return;
    }
    if (selectedProject) {
      setProjectForm({
        name: selectedProject.name || "",
        cameraRules: selectedProject.cameraRules || "",
        videoStyleNotes: selectedProject.videoStyleNotes || "",
      });
      setSelectedGeneratedId(null);
    }
  }, [selectedProjectId, selectedProject, emptyForm]);

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    if (selectedProject) {
      await updateProject(selectedProject.id, projectForm);
      return;
    }
    const newId = await addProject(projectForm);
    setSelectedProjectId(newId);
  };

  const handleAddScene = async () => {
    if (!selectedProjectId) return;
    await addScene(`Scene ${nextSceneNumber}`);
  };

  const handleGenerateScene = async () => {
    if (!selectedProjectId) return;
    const name = `Scene ${generatedScenes.length + 1}`;
    await addGeneratedScene({ name });
  };

  const handleGenerateAll = async () => {
    if (!selectedProjectId || !scenes.length) return;
    let offset = generatedScenes.length;
    for (const scene of scenes) {
      offset += 1;
      await addGeneratedScene({
        name: `Scene ${offset}`,
        note: scene.name,
      });
    }
  };

  const handleCombineSelected = async () => {
    if (!selectedProjectId || !selectedGeneratedId) return;
    const enabledScenes = scenes.filter((scene) => scene.enabled);
    const selectedGenerated = generatedScenes.find(
      (item) => item.id === selectedGeneratedId
    );
    const noteParts = [
      enabledScenes.length
        ? `Enabled scenes: ${enabledScenes.map((s) => s.name).join(", ")}`
        : "No enabled scenes",
      selectedGenerated
        ? `Generated: ${selectedGenerated.name}`
        : "Generated: none",
    ];
    await addCombinedScene({ note: noteParts.join(" | ") });
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                Sign in with Google to manage your projects and scenes. Your data
                is stored per account.
              </div>
              {authError ? (
                <div className="empty">Auth error: {authError}</div>
              ) : null}
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => router.push("/login")}>Go to login</Button>
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
            <div className={styles.title}>Projects & Scenes</div>
            <div className={styles.subtitle}>
              Signed in as {user.email || user.displayName || "your account"}.
              Data is stored per account in Firebase.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.stack}>
            <Card title={selectedProject ? "Edit Project" : "Add Project"}>
              <form className="stack" onSubmit={handleProjectSubmit}>
                <Input
                  label="Project Name"
                  placeholder="Enter project name"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
                <Textarea
                  label="Camera Rules"
                  placeholder="Write camera rules"
                  value={projectForm.cameraRules}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, cameraRules: e.target.value }))
                  }
                  rows={3}
                />
                <Textarea
                  label="Video Style Notes"
                  placeholder="Write style notes"
                  value={projectForm.videoStyleNotes}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      videoStyleNotes: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="submit">
                    {selectedProject ? "Update Project" : "Create Project"}
                  </Button>
                  {selectedProject && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={async () => {
                        await deleteProject(selectedProject.id);
                        setSelectedProjectId(null);
                        setProjectForm(emptyForm);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </form>
            </Card>

          </div>

          <div className={styles.stack}>
            <Card
              title="Scenes"
              actions={
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={handleAddScene} disabled={!selectedProjectId}>
                    Add Scene
                  </Button>
                  <Button size="sm" onClick={handleGenerateScene} disabled={!selectedProjectId}>
                    Generate Scene
                  </Button>
                </div>
              }
            >
              {selectedProjectId ? (
                <DraggableList
                  items={scenes}
                  onReorder={reorderScenes}
                  emptyMessage="No scenes yet. Add one to begin."
                  renderItem={(scene) => (
                    <div className="list-item">
                      <div style={{ flex: 1 }}>
                        <input
                          className="input"
                          value={scene.name}
                          onChange={(e) =>
                            updateScene(scene.id, { name: e.target.value })
                          }
                        />
                        <Textarea
                          label="Location"
                          placeholder="Enter location"
                          value={scene.location || ""}
                          onChange={(e) =>
                            updateScene(scene.id, { location: e.target.value })
                          }
                          rows={2}
                        />
                        <Textarea
                          label="Description"
                          placeholder="Describe the scene"
                          value={scene.description || ""}
                          onChange={(e) =>
                            updateScene(scene.id, { description: e.target.value })
                          }
                          rows={3}
                        />
                        <Textarea
                          label="Dialog"
                          placeholder="Write dialog"
                          value={scene.dialog || ""}
                          onChange={(e) =>
                            updateScene(scene.id, { dialog: e.target.value })
                          }
                          rows={3}
                        />
                        <Select
                          label="Character"
                          value={scene.characterId || ""}
                          options={characterOptions}
                          onChange={(e) =>
                            updateScene(scene.id, { characterId: e.target.value })
                          }
                        />
                        <Select
                          label="Duration"
                          value={String(scene.durationSeconds ?? 5)}
                          options={durationOptions}
                          onChange={(e) =>
                            updateScene(scene.id, {
                              durationSeconds: Number(e.target.value),
                            })
                          }
                        />
                        <div className="list-item__subtitle">Order #{scene.order + 1}</div>
                      </div>
                      <div className="card__actions">
                        <Toggle
                          checked={!!scene.enabled}
                          onChange={(checked) => updateScene(scene.id, { enabled: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScene(scene.id)}
                        >
                          Delete
                        </Button>
                      </div>
        </div>
                  )}
                />
              ) : (
                <EmptyState message="Select a project to manage scenes." />
              )}
            </Card>

            <Card
              title="Generated Scenes"
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateAll}
                  disabled={!selectedProjectId || !scenes.length}
                >
                  Generate All Scenes
                </Button>
              }
            >
              {selectedProjectId ? (
                generatedScenes.length ? (
                  <div className="list">
                    {generatedScenes.map((item) => (
                      <div key={item.id} className="list-item">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <RadioItem
                            label=""
                            checked={selectedGeneratedId === item.id}
                            onChange={(checked) => checked && setSelectedGeneratedId(item.id)}
                          />
                          <div>
                            <div className="list-item__title">{item.name}</div>
                            {item.note ? (
                              <div className="list-item__subtitle">{item.note}</div>
                            ) : null}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteGeneratedScene(item.id);
                            if (selectedGeneratedId === item.id) {
                              setSelectedGeneratedId(null);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No generated scenes yet." />
                )
              ) : (
                <EmptyState message="Select a project to manage generated scenes." />
              )}
            </Card>
          </div>

          <div className={styles.stack}>
            <Card
              title="Combined Scenes"
              actions={
                <Button
                  size="sm"
                  onClick={handleCombineSelected}
                  disabled={
                    !selectedProjectId || !generatedScenes.length || !selectedGeneratedId
                  }
                >
                  Combine Selected
                </Button>
              }
            >
              {selectedProjectId ? (
                combinedScenes.length ? (
                  <div className="list">
                    {combinedScenes.map((item) => (
                      <div key={item.id} className="list-item">
                        <div>
                          <div className="list-item__title">Combined Scene</div>
                          <div className="list-item__subtitle">{item.note}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCombinedScene(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No combined scenes yet." />
                )
              ) : (
                <EmptyState message="Select a project to view combined scenes." />
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
