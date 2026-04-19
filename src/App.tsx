import { useEffect, useMemo, useState } from "react";
import { getMe, getProjects, getMergeRequests, setGitlabBaseUrl } from "./api";
import type { GitLabProject, GitLabUser, MergeRequest } from "./types";
import TokenGate from "./components/TokenGate";
import RepoList from "./components/RepoList";
import MRTree from "./components/MRTree";
import {
  LogOut,
  RefreshCw,
  GitMerge,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const STATES = ["opened", "merged", "closed", "all"] as const;
type StateFilter = (typeof STATES)[number];

export default function App() {
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("gitlab_token") || "",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem("sidebar_collapsed") === "1",
  );
  const toggleSidebar = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };
  const [me, setMe] = useState<GitLabUser | null>(null);
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GitLabProject | null>(
    null,
  );
  const [mrs, setMrs] = useState<MergeRequest[]>([]);
  const [mrState, setMrState] = useState<StateFilter>("opened");
  const [loadingMRs, setLoadingMRs] = useState(false);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    getMe()
      .then(setMe)
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, [token]);

  const loadProjects = async (q = "") => {
    if (!token) return;
    setLoadingProjects(true);
    setError("");
    try {
      setProjects(await getProjects(q));
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (token) loadProjects(""); /* eslint-disable-next-line */
  }, [token]);

  const loadMRs = async (
    project: GitLabProject,
    state: StateFilter = mrState,
  ) => {
    setLoadingMRs(true);
    setError("");
    try {
      setMrs(await getMergeRequests(project.id, state));
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoadingMRs(false);
    }
  };

  const onSelectProject = (p: GitLabProject) => {
    setSelectedProject(p);
    loadMRs(p, mrState);
  };

  const onChangeState = (s: StateFilter) => {
    setMrState(s);
    if (selectedProject) loadMRs(selectedProject, s);
  };

  const handleLogout = () => {
    localStorage.removeItem("gitlab_token");
    setToken("");
    setMe(null);
    setProjects([]);
    setSelectedProject(null);
    setMrs([]);
  };

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return projects;
    const q = projectSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.path_with_namespace.toLowerCase().includes(q),
    );
  }, [projects, projectSearch]);

  if (!token) {
    return (
      <TokenGate
        onSave={(t, url) => {
          setGitlabBaseUrl(url);
          localStorage.setItem("gitlab_token", t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className=" mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-slate-950 shadow-glow">
              <GitMerge className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <h1 className="font-semibold tracking-tight">
                Merge Request Status
              </h1>
              <div className="text-[11px] text-slate-500">
                Hierarchical MR viewer for GitLab
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {me && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60">
                {me.avatar_url && (
                  <img
                    src={me.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-slate-300">{me.name || me.username}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className=" mx-auto w-full px-5 mt-4">
          <div className="rounded-lg bg-rose-950/50 border border-rose-900/70 text-rose-200 px-3.5 py-2.5 text-sm animate-fade-in">
            {error}
          </div>
        </div>
      )}

      <main
        className={`mx-auto w-full px-2 py-2 grid gap-2 flex-1 ${
          sidebarCollapsed ? "grid-cols-[5rem_minmax(0,1fr)]" : "grid-cols-12"
        }`}
      >
        <aside
          className={`panel py-3 px-1 flex flex-col sticky top-[4.25rem] self-start max-h-[calc(100vh-5.5rem)] ${
            sidebarCollapsed
              ? ""
              : "col-span-12 md:col-span-4 lg:col-span-3 p-3.5"
          }`}
        >
          <div
            className={`flex items-center mb-3 ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!sidebarCollapsed && (
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Repositories
              </h2>
            )}
            <div className="flex items-center gap-1">
              {!sidebarCollapsed && (
                <button
                  onClick={() => loadProjects(projectSearch)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingProjects ? "animate-spin" : ""}`}
                  />
                </button>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {!sidebarCollapsed && (
            <input
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search repositories…"
              className="w-full mb-3 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          )}
          <RepoList
            projects={filteredProjects}
            selectedId={selectedProject?.id ?? null}
            onSelect={onSelectProject}
            loading={loadingProjects}
            collapsed={sidebarCollapsed}
          />
        </aside>

        <section
          className={`panel p-4 flex flex-col min-h-[60vh] min-w-0 ${
            sidebarCollapsed ? "" : "col-span-12 md:col-span-8 lg:col-span-9"
          }`}
        >
          {!selectedProject ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
              <GitMerge className="w-8 h-8 opacity-40" />
              <div className="text-sm">
                Select a repository to view its merge requests.
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {selectedProject.name}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedProject.path_with_namespace}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-800 bg-slate-950/60">
                    {STATES.map((s) => (
                      <button
                        key={s}
                        onClick={() => onChangeState(s)}
                        className={`px-3 py-1 text-xs rounded-md capitalize transition ${
                          mrState === s
                            ? "bg-brand-500/20 text-brand-200 shadow-inner"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => loadMRs(selectedProject, mrState)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
                    title="Refresh MRs"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingMRs ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>
              <MRTree mrs={mrs} loading={loadingMRs} />
            </>
          )}
        </section>
      </main>

      <footer className="text-center text-[11px] text-slate-600 py-4">
        <p className="text-[10px] sm:text-[11px] text-custom-text-dim font-medium">
          &copy; {currentYear} Merge Request Status maintained by&nbsp;
          <a
            href="https://codebynithin.com"
            target="_blank"
            className="text-custom-accent hover:underline"
          >
            Nithin V
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
}
