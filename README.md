# Merge Request Status

Client-only React app (TypeScript + Vite + SCSS + Tailwind) to track GitLab merge requests, grouped as a **hierarchical tree by target branch**. If an MR's source branch is itself the target of another MR, the children nest under the parent to visualize stacked/chained MRs.

No backend, no database. The browser calls the GitLab REST API directly with your personal access token (`PRIVATE-TOKEN` header). The token and GitLab URL live only in `localStorage`.

## Features

- Paste a GitLab PAT (scope: `read_api`) — stored in `localStorage` only
- List repos you're a member of, with search
- Select a repo → fetches its merge requests
- Filter by state: `opened | merged | closed | all`
- Hierarchical rendering by target branch (collapsible), with nested chains for stacked MRs
- Shows: MR iid, title, state (+draft), source→target branches, created/updated dates, author, assignees, reviewers, labels
- Links out to the GitLab MR page

## Prerequisites

- Node.js 18+

## Setup

```bash
npm install
```

### Run

```bash
npm run start:dev          # vite dev server at http://localhost:5173
npm start                  # vite build + preview
npm run build              # production bundle in ./dist
```

Open http://localhost:5173, enter your GitLab URL (defaults to `https://gitlab.com`) and a personal access token (`User Settings → Access Tokens`, scope `read_api`).

## Deploy to GitHub Pages

A workflow at `@/.github/workflows/deploy.yml` builds and deploys to the `gh-pages` branch on every push to `master`/`main`.

One-time setup in your GitHub repo:

1. **Settings → Pages → Build and deployment → Source** → **Deploy from a branch**
2. **Branch** → `gh-pages` → `/ (root)` → **Save**

The site will be served at `https://<user>.github.io/<repo>/`. The workflow automatically injects `VITE_BASE=/<repo>/` so asset paths resolve correctly, and copies `index.html` to `404.html` for SPA-style fallback.

## CORS note

- `gitlab.com` enables CORS on its API by default — works out of the box.
- **Self-hosted GitLab**: ensure the API allows your origin. In Admin Area → Settings → Network → Outbound requests / CORS, or via `gitlab.rb`: `gitlab_rails['allowed_hosts']` and Rack CORS config. If your instance doesn't allow CORS, host the app on the same origin as GitLab, or reintroduce a small proxy.

## How the tree is built

Given all MRs for the selected project:

1. Group MRs by `target_branch`.
2. Any target branch that is **not** the source of another MR becomes a root node.
3. For every MR, if its `source_branch` is itself a target for other MRs, those MRs nest beneath it — producing chains like `main ← release/1.0 ← feature/xyz`.

This surfaces stacked merge request chains naturally while keeping unrelated target branches as siblings.

## Project layout

```
merge-request-status/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── api.ts              # calls GitLab REST API v4 directly
    ├── types.ts
    ├── styles/
    │   ├── index.scss
    │   ├── _variables.scss
    │   └── _components.scss
    └── components/
        ├── TokenGate.tsx
        ├── RepoList.tsx
        └── MRTree.tsx
```

## Scripts

| Script              | Purpose                           |
| ------------------- | --------------------------------- |
| `npm run dev`       | Vite dev server                   |
| `npm run start:dev` | Alias for `dev`                   |
| `npm run build`     | Production bundle in `./dist`     |
| `npm run preview`   | Serve the built bundle            |
| `npm start`         | Build then preview                |
| `npm run typecheck` | TypeScript check without emitting |

## Notes

- To target GitHub/Bitbucket, swap the calls in `src/api.ts` for those providers' APIs; the UI contract (`projects`, `merge_requests` with `source_branch`/`target_branch`) is platform-agnostic.
- The token is stored in `localStorage` and sent only to the configured GitLab host via the `PRIVATE-TOKEN` header.
