"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { Card, Button, Input, Textarea, Select, Toggle, RadioItem, EmptyState } from "./components/ui";
import { DraggableList } from "./components/DraggableList";
import { useProjects } from "../lib/hooks/projects";
import { useScenes } from "../lib/hooks/scenes";
import { useGeneratedScenes } from "../lib/hooks/generatedScenes";
import { useCombinedScenes } from "../lib/hooks/combinedScenes";

const CHARACTERS = [
  { value: "", label: "Select character" },
  { value: "alex", label: "Alex" },
  { value: "bailey", label: "Bailey" },
  { value: "casey", label: "Casey" },
  { value: "drew", label: "Drew" },
];

export default function Home() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedGeneratedId, setSelectedGeneratedId] = useState(null);

  const {
    scenes,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    nextSceneNumber,
  } = useScenes(selectedProjectId);
  const {
    generatedScenes,
    addGeneratedScene,
    deleteGeneratedScene,
  } = useGeneratedScenes(selectedProjectId);
  const { combinedScenes, addCombinedScene, deleteCombinedScene } =
    useCombinedScenes(selectedProjectId);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const emptyForm = useMemo(
    () => ({
      name: "",
      cameraRules: "",
      videoStyleNotes: "",
      characterId: CHARACTERS[0].value,
    }),
    []
  );

  const [projectForm, setProjectForm] = useState(emptyForm);

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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Projects & Scenes</div>
            <div className={styles.subtitle}>
              Manage projects, scenes, generated scenes, and combined scenes. Data
              persists in Firebase (user 1111, emulator-ready).
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.stack}>
            <Card
              title={selectedProject ? "Edit Project" : "Add Project"}
              actions={
                selectedProject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setProjectForm(emptyForm);
                    }}
                  >
                    New Project
                  </Button>
                )
              }
            >
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
                <Select
                  label="Character"
                  value={projectForm.characterId}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      characterId: e.target.value,
                    }))
                  }
                  options={CHARACTERS}
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

            <Card title="Projects">
              {projects.length ? (
                <div className="list">
                  {projects.map((project) => (
                    <div key={project.id} className="list-item">
                      <div>
                        <div className="list-item__title">{project.name}</div>
                        <div className="list-item__subtitle">
                          {project.cameraRules || "No camera rules yet."}
                        </div>
                      </div>
                      <div className="card__actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setProjectForm({
                              name: project.name || "",
                              cameraRules: project.cameraRules || "",
                              videoStyleNotes: project.videoStyleNotes || "",
                              characterId: project.characterId || CHARACTERS[0].value,
                            });
                            setSelectedGeneratedId(null);
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteProject(project.id);
                            if (selectedProjectId === project.id) {
                              setSelectedProjectId(null);
                              setProjectForm(emptyForm);
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
                <EmptyState message="No projects yet. Create one to get started." />
              )}
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
