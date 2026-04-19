import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import type { GitLabUser, MergeRequest, MergeRequestState } from "../types";

interface BranchNodeData {
  branch: string;
  mrs: { mr: MergeRequest; child: BranchNodeData | null }[];
  cyclic?: boolean;
}

function buildTree(mrs: MergeRequest[]): BranchNodeData[] {
  const byTarget = new Map<string, MergeRequest[]>();
  const sourceSet = new Set(mrs.map((m) => m.source_branch));

  for (const mr of mrs) {
    if (!byTarget.has(mr.target_branch)) byTarget.set(mr.target_branch, []);
    byTarget.get(mr.target_branch)!.push(mr);
  }

  const rootTargets = [...byTarget.keys()].filter((t) => !sourceSet.has(t));
  const roots = rootTargets.length ? rootTargets : [...byTarget.keys()];

  const buildBranchNode = (
    branch: string,
    visited: Set<string> = new Set(),
  ): BranchNodeData => {
    if (visited.has(branch)) return { branch, mrs: [], cyclic: true };
    visited.add(branch);
    const list = byTarget.get(branch) || [];
    return {
      branch,
      mrs: list.map((mr) => ({
        mr,
        child: byTarget.has(mr.source_branch)
          ? buildBranchNode(mr.source_branch, new Set(visited))
          : null,
      })),
    };
  };

  return roots.sort().map((b) => buildBranchNode(b));
}

function fmtDate(s?: string): string {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StateBadge({
  state,
  draft,
}: {
  state: MergeRequestState;
  draft?: boolean;
}) {
  const map: Record<MergeRequestState, string> = {
    opened: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    merged: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    closed: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    locked: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  };
  const cls = map[state] || "bg-slate-700/30 text-slate-200 border-slate-700";
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className={`chip ${cls}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {state}
      </span>
      {draft && (
        <span className="chip bg-amber-500/10 text-amber-300 border-amber-500/30">
          draft
        </span>
      )}
    </div>
  );
}

function People({ label, users }: { label: string; users?: GitLabUser[] }) {
  if (!users || users.length === 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-slate-400">
      <span className="text-slate-500">{label}:</span>
      <div className="flex -space-x-1">
        {users.slice(0, 4).map((u) => (
          <img
            key={u.id}
            src={u.avatar_url}
            alt={u.name}
            title={u.name || u.username}
            className="w-5 h-5 rounded-full border border-slate-900"
          />
        ))}
      </div>
      {users.length > 4 && (
        <span className="text-slate-500">+{users.length - 4}</span>
      )}
    </div>
  );
}

function MRRow({ mr }: { mr: MergeRequest }) {
  return (
    <div className="mr-card rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={mr.web_url}
            target="_blank"
            rel="noreferrer"
            className="group font-medium text-slate-100 hover:text-brand-300 inline-flex items-center gap-1.5 max-w-full"
          >
            <span className="text-slate-500 font-mono text-sm shrink-0">
              !{mr.iid}
            </span>
            <span className="truncate">{mr.title}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition shrink-0" />
          </a>
          <div className="mt-1.5 text-xs text-slate-400 flex items-center flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-slate-500" />
              <span className="branch-label">{mr.source_branch}</span>
              <span className="text-slate-600">→</span>
              <span className="branch-label">{mr.target_branch}</span>
            </span>
            <span className="text-slate-500">
              updated {fmtDate(mr.updated_at)}
            </span>
          </div>
        </div>
        <StateBadge state={mr.state} draft={mr.draft || mr.work_in_progress} />
      </div>
      <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-1.5">
        {mr.author && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {mr.author.avatar_url && (
              <img
                src={mr.author.avatar_url}
                alt=""
                className="w-5 h-5 rounded-full border border-slate-800"
              />
            )}
            <span>{mr.author.name || mr.author.username}</span>
          </div>
        )}
        <People label="assignees" users={mr.assignees} />
        <People label="reviewers" users={mr.reviewers} />
        {mr.labels && mr.labels.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {mr.labels.slice(0, 6).map((l) => (
              <span
                key={l}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {l}
              </span>
            ))}
            {mr.labels.length > 6 && (
              <span className="text-[10px] text-slate-500">
                +{mr.labels.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BranchNode({
  node,
  depth = 0,
}: {
  node: BranchNodeData;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const count = node.mrs.length;
  return (
    <div className={`branch-node ${depth === 0 ? "" : "is-nested"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group w-full flex items-center gap-2 text-left py-1.5 text-sm text-slate-300 hover:text-slate-100 transition"
      >
        <span className="text-slate-500 group-hover:text-slate-300 transition">
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <GitBranch className="w-4 h-4 text-brand-400/80" />
        <span className="branch-label">{node.branch}</span>
        <span className="text-xs text-slate-500">
          {count} MR{count === 1 ? "" : "s"}
        </span>
        {node.cyclic && (
          <span className="chip bg-amber-500/10 text-amber-300 border-amber-500/30">
            cycle
          </span>
        )}
      </button>
      {open && (
        <div className="space-y-2 mt-2 mb-3">
          {node.mrs.map(({ mr, child }) => (
            <div key={mr.id} className="space-y-2">
              <MRRow mr={mr} />
              {child && <BranchNode node={child} depth={depth + 1} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  mrs: MergeRequest[];
  loading: boolean;
}

export default function MRTree({ mrs, loading }: Props) {
  const tree = useMemo(() => buildTree(mrs), [mrs]);

  if (loading && mrs.length === 0) {
    return (
      <div className="flex-1 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton animate-shimmer h-20 rounded-lg" />
        ))}
      </div>
    );
  }
  if (!loading && mrs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
        <GitBranch className="w-8 h-8 opacity-40" />
        <div className="text-sm">No merge requests for the selected state.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1 -mr-1">
      {tree.map((node) => (
        <BranchNode key={node.branch} node={node} />
      ))}
    </div>
  );
}
