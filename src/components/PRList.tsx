"use client";

import { PullRequest } from "@/types";

interface PRListProps {
  prs: PullRequest[];
}

export function PRList({ prs }: PRListProps) {
  if (prs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pull requests found in the selected period.
      </div>
    );
  }

  const prsByRepo = prs.reduce((acc, pr) => {
    if (!acc[pr.repo]) {
      acc[pr.repo] = [];
    }
    acc[pr.repo].push(pr);
    return acc;
  }, {} as Record<string, PullRequest[]>);

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Found {prs.length} merged PRs across {Object.keys(prsByRepo).length} repositories
      </div>
      {Object.entries(prsByRepo).map(([repo, repoPRs]) => (
        <div key={repo} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {repo} ({repoPRs.length} PRs)
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {repoPRs.slice(0, 5).map((pr) => (
              <div key={pr.number} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      #{pr.number} {pr.title}
                    </a>
                    <div className="mt-1 text-sm text-gray-500">
                      by {pr.author} on{" "}
                      {new Date(pr.mergedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    <span className="text-green-600">+{pr.additions}</span>{" "}
                    <span className="text-red-600">-{pr.deletions}</span>
                  </div>
                </div>
              </div>
            ))}
            {repoPRs.length > 5 && (
              <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                ... and {repoPRs.length - 5} more PRs
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
