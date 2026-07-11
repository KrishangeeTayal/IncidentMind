// GitHub integration wrapper.
//
// Placeholder for the read-only operations the agents will need:
// fetching recent commits, looking up PR status, and reading
// issue context. The real implementation will use Octokit.

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  url: string;
  committedAt: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  url: string;
  author: string;
  createdAt: string;
  mergedAt: string | null;
}

export interface GitHubConfig {
  token: string;
  owner?: string;
  repo?: string;
  baseUrl?: string;
}

export interface GitHubClient {
  listRecentCommits(limit?: number): Promise<GitHubCommit[]>;
  getPullRequest(number: number): Promise<GitHubPullRequest | null>;
  ping(): Promise<boolean>;
}

/**
 * Build a GitHub client.
 *
 * NOTE: stub. Real implementation will be added in a later iteration.
 */
export function createGitHubClient(_config: GitHubConfig): GitHubClient {
  const notImplemented = (name: string): never => {
    throw new Error(`[github] ${name}() not implemented`);
  };
  return {
    listRecentCommits: () => Promise.resolve([]).then(() => {
      notImplemented('listRecentCommits');
    }),
    getPullRequest: () => Promise.resolve(null).then(() => {
      notImplemented('getPullRequest');
    }),
    ping: () => Promise.resolve(false),
  };
}
