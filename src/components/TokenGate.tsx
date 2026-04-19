import { useState, FormEvent } from "react";
import { KeyRound, GitMerge, Server } from "lucide-react";
import { DEFAULT_GITLAB_URL, getGitlabBaseUrl } from "../api";

interface Props {
  onSave: (token: string, baseUrl: string) => void;
}

export default function TokenGate({ onSave }: Props) {
  const [value, setValue] = useState("");
  const [baseUrl, setBaseUrl] = useState<string>(
    () => getGitlabBaseUrl() || DEFAULT_GITLAB_URL,
  );
  const [show, setShow] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    const u = baseUrl.trim() || DEFAULT_GITLAB_URL;
    if (v) onSave(v, u);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md panel p-7 animate-fade-in"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-slate-950 shadow-glow">
            <GitMerge className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-tight">
              Merge Request Status
            </h1>
            <div className="text-xs text-slate-500">
              Stacked MRs, visualized.
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-6">
          Use a GitLab personal access token with scope{" "}
          <code className="px-1 py-0.5 rounded bg-slate-800/70 text-slate-200 text-[12px] font-mono">
            read_api
          </code>
          . Your credentials are stored only in this browser and sent directly
          to GitLab.
        </p>

        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em]">
          GitLab URL
        </label>
        <div className="mt-1.5 mb-4 relative">
          <Server className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://gitlab.com"
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em]">
          Access token
        </label>
        <div className="mt-1.5 relative">
          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="glpat-xxxxxxxxxxxxxxxx"
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-14 py-2.5 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium px-2 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={!value.trim()}
          className="mt-6 w-full py-2.5 rounded-lg font-medium tracking-tight bg-gradient-to-br from-brand-400 to-brand-600 text-slate-950 shadow-glow hover:brightness-110 active:brightness-95 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed transition"
        >
          Continue
        </button>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          Create a token at{" "}
          <span className="font-mono">User Settings → Access Tokens</span>.
        </p>
      </form>
    </div>
  );
}
