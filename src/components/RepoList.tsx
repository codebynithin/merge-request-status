import { Folder } from 'lucide-react';
import type { GitLabProject } from '../types';

interface Props {
  projects: GitLabProject[];
  selectedId: number | null;
  onSelect: (p: GitLabProject) => void;
  loading: boolean;
  collapsed?: boolean;
}

function initials(name: string): string {
  const cleaned = name.replace(/[_\-./]+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function RepoList({
  projects,
  selectedId,
  onSelect,
  loading,
  collapsed = false,
}: Props) {
  if (loading && projects.length === 0) {
    return (
      <ul className={`flex-1 overflow-hidden ${collapsed ? 'space-y-2' : 'space-y-1.5'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            className={`skeleton animate-shimmer rounded-lg ${
              collapsed ? 'h-9 w-9 mx-auto' : 'h-10'
            }`}
          />
        ))}
      </ul>
    );
  }
  if (projects.length === 0) {
    return (
      <div className="text-slate-500 text-xs py-6 text-center">
        {collapsed ? '—' : 'No repositories found.'}
      </div>
    );
  }

  if (collapsed) {
    return (
      <ul className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden -mx-1 px-1 gap-2">
        {projects.map((p) => {
          const active = p.id === selectedId;
          return (
            <li key={p.id} className="flex justify-center p-2">
              <button
                onClick={() => onSelect(p)}
                title={`${p.name}\n${p.path_with_namespace}`}
                className={`relative w-9 h-9 rounded-lg grid place-items-center text-[11px] font-semibold tracking-tight transition border ${
                  active
                    ? 'bg-brand-500/15 border-brand-500/50 text-brand-200 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                }`}
              >
                {initials(p.name)}
                {active && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-brand-400" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto -mx-1 pr-1 space-y-0.5">
      {projects.map((p) => {
        const active = p.id === selectedId;
        return (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p)}
              className={`group w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 text-sm transition border ${
                active
                  ? 'bg-brand-500/10 border-brand-500/40 text-slate-100'
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-800'
              }`}
            >
              <Folder
                className={`w-4 h-4 mt-0.5 shrink-0 transition ${
                  active ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium leading-tight">{p.name}</div>
                <div className="truncate text-[11px] text-slate-500 font-mono mt-0.5">
                  {p.path_with_namespace}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
