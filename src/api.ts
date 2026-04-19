import axios, { AxiosInstance } from "axios";
import type { GitLabProject, GitLabUser, MergeRequest } from "./types";

export const DEFAULT_GITLAB_URL = "https://gitlab.com";

export function getGitlabBaseUrl(): string {
  return (
    localStorage.getItem("gitlab_base_url") || DEFAULT_GITLAB_URL
  ).replace(/\/+$/, "");
}

export function setGitlabBaseUrl(url: string): void {
  localStorage.setItem("gitlab_base_url", url.replace(/\/+$/, ""));
}

function client(): AxiosInstance {
  const token = localStorage.getItem("gitlab_token") || "";
  return axios.create({
    baseURL: `${getGitlabBaseUrl()}/api/v4`,
    headers: { "PRIVATE-TOKEN": token },
    timeout: 20000,
  });
}

export const getMe = (): Promise<GitLabUser> =>
  client()
    .get<GitLabUser>("/user")
    .then((r) => r.data);

export const getProjects = (search = ""): Promise<GitLabProject[]> =>
  client()
    .get<GitLabProject[]>("/projects", {
      params: {
        membership: true,
        order_by: "last_activity_at",
        sort: "desc",
        per_page: 100,
        simple: true,
        search: search || undefined,
      },
    })
    .then((r) => r.data);

export const getMergeRequests = (
  projectId: number | string,
  state: string = "opened",
): Promise<MergeRequest[]> =>
  client()
    .get<MergeRequest[]>(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests`,
      {
        params: {
          state,
          per_page: 100,
          order_by: "updated_at",
          sort: "desc",
          scope: "all",
        },
      },
    )
    .then((r) => r.data);
