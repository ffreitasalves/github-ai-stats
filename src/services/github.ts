import { Octokit } from "@octokit/rest";
import { Repository, PullRequest, Commit } from "@/types";
import { isDateInRange } from "@/lib/utils";

let octokitInstance: Octokit | null = null;

function getOctokit(): Octokit {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  return octokitInstance;
}

export async function getOrganizationRepos(org: string): Promise<Repository[]> {
  const octokit = getOctokit();
  const repos: Repository[] = [];

  try {
    // Try to get org repos first
    const iterator = octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
      org,
      per_page: 100,
      sort: "updated",
      direction: "desc",
    });

    for await (const { data } of iterator) {
      for (const repo of data) {
        repos.push({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          private: repo.private,
          defaultBranch: repo.default_branch,
          updatedAt: repo.updated_at || "",
        });
      }
    }
  } catch (error: unknown) {
    // If org repos fail, try user repos (for personal accounts)
    const octokitError = error as { status?: number };
    if (octokitError.status === 404) {
      const iterator = octokit.paginate.iterator(
        octokit.rest.repos.listForUser,
        {
          username: org,
          per_page: 100,
          sort: "updated",
          direction: "desc",
        }
      );

      for await (const { data } of iterator) {
        for (const repo of data) {
          repos.push({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            private: repo.private,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at || "",
          });
        }
      }
    } else {
      throw error;
    }
  }

  return repos;
}

export async function getPRCommits(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<Commit[]> {
  const octokit = getOctokit();
  const commits: Commit[] = [];

  try {
    const { data } = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });

    for (const commit of data) {
      commits.push({
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0], // First line only
        author: commit.author?.login || commit.commit.author?.name || "unknown",
        date: commit.commit.author?.date || "",
      });
    }
  } catch (error) {
    console.error(`Failed to get commits for PR #${pullNumber}:`, error);
  }

  return commits;
}

export async function getMergedPRs(
  org: string,
  repoNames: string[],
  fromDate: string,
  toDate: string,
  onProgress?: (current: number, total: number, repoName: string) => void
): Promise<PullRequest[]> {
  const octokit = getOctokit();
  const allPRs: PullRequest[] = [];

  let current = 0;
  const total = repoNames.length;

  for (const repoName of repoNames) {
    current++;
    onProgress?.(current, total, repoName);

    try {
      const iterator = octokit.paginate.iterator(octokit.rest.pulls.list, {
        owner: org,
        repo: repoName,
        state: "closed",
        sort: "updated",
        direction: "desc",
        per_page: 100,
      });

      let foundOldPR = false;

      for await (const { data } of iterator) {
        for (const pr of data) {
          // Skip if not merged
          if (!pr.merged_at) continue;

          // Check if PR is in date range
          if (!isDateInRange(pr.merged_at, fromDate, toDate)) {
            // If PR is older than fromDate, we can stop paginating
            const prDate = new Date(pr.merged_at);
            const from = new Date(fromDate);
            if (prDate < from) {
              foundOldPR = true;
              break;
            }
            continue;
          }

          // Get commits for this PR
          const commits = await getPRCommits(org, repoName, pr.number);

          allPRs.push({
            repo: repoName,
            number: pr.number,
            title: pr.title,
            description: pr.body,
            author: pr.user?.login || "unknown",
            mergedAt: pr.merged_at,
            commits,
            additions: pr.additions || 0,
            deletions: pr.deletions || 0,
            changedFiles: pr.changed_files || 0,
            url: pr.html_url,
          });
        }

        if (foundOldPR) break;
      }
    } catch (error) {
      console.error(`Failed to get PRs for ${repoName}:`, error);
    }
  }

  // Sort by merged date descending
  allPRs.sort(
    (a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime()
  );

  return allPRs;
}
