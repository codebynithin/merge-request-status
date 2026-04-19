export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  star_count?: number;
}

export type MergeRequestState = 'opened' | 'closed' | 'merged' | 'locked';

export interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  state: MergeRequestState;
  draft?: boolean;
  work_in_progress?: boolean;
  created_at: string;
  updated_at: string;
  web_url: string;
  source_branch: string;
  target_branch: string;
  author?: GitLabUser;
  assignees?: GitLabUser[];
  reviewers?: GitLabUser[];
  labels?: string[];
}
