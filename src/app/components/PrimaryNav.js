"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui";
import { useAuth } from "../../lib/auth";
import { useProjects } from "../../lib/hooks/projects";
import { useProjectSelection } from "../../lib/projectSelection";

export function PrimaryNav() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { projects } = useProjects(user?.uid);
  const { selectedProjectId, setSelectedProjectId } = useProjectSelection();

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    router.push("/");
  };

  const handleNewProject = () => {
    setSelectedProjectId(null);
    router.push("/");
  };

  return (
    <aside className="primary-nav">
      <div className="primary-nav__brand">wgVideo</div>
      <nav className="primary-nav__links">
        <Link className="primary-nav__item" href="/">
          Projects
        </Link>
        <Link className="primary-nav__item" href="/characters">
          Characters
        </Link>
        <Link className="primary-nav__item" href="/settings">
          Settings
        </Link>
      </nav>
      <div className="primary-nav__section">
        <div className="primary-nav__section-title">Saved Projects</div>
        {loading ? (
          <div className="primary-nav__hint">Loading projects...</div>
        ) : !user ? (
          <div className="primary-nav__hint">Sign in to view projects.</div>
        ) : projects.length ? (
          <>
            <div className="primary-nav__section-actions">
              <Button variant="secondary" size="sm" onClick={handleNewProject}>
                New Project
              </Button>
            </div>
            <ul className="primary-nav__project-list">
              {projects.map((project) => (
                <li key={project.id} className="primary-nav__project-item">
                  <button
                    type="button"
                    className={`primary-nav__project-button${
                      selectedProjectId === project.id ? " is-active" : ""
                    }`}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    {project.name || "Untitled Project"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="primary-nav__section-actions">
              <Button variant="secondary" size="sm" onClick={handleNewProject}>
                New Project
              </Button>
            </div>
            <div className="primary-nav__hint">No saved projects yet.</div>
          </>
        )}
      </div>
    </aside>
  );
}
