export interface Repository {
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface PullRequest {
  repo: string;
  number: number;
  title: string;
  description: string | null;
  author: string;
  mergedAt: string;
  commits: Commit[];
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
}

export interface PRsResponse {
  totalPRs: number;
  prs: PullRequest[];
}

export interface SummaryStats {
  features: number;
  fixes: number;
  refactoring: number;
  docs: number;
  other: number;
}

export interface SummaryResponse {
  summary: string;
  stats: SummaryStats;
}

export interface ReposResponse {
  repos: Repository[];
}

export interface APIError {
  error: string;
  details?: string;
}
