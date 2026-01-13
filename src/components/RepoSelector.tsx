"use client";

import { Repository } from "@/types";

interface RepoSelectorProps {
  repos: Repository[];
  selectedRepos: string[];
  onSelectionChange: (repos: string[]) => void;
}

export function RepoSelector({
  repos,
  selectedRepos,
  onSelectionChange,
}: RepoSelectorProps) {
  const handleToggleAll = () => {
    if (selectedRepos.length === repos.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(repos.map((r) => r.name));
    }
  };

  const handleToggleRepo = (repoName: string) => {
    if (selectedRepos.includes(repoName)) {
      onSelectionChange(selectedRepos.filter((r) => r !== repoName));
    } else {
      onSelectionChange([...selectedRepos, repoName]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Select Repositories ({selectedRepos.length} of {repos.length})
        </label>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {selectedRepos.length === repos.length ? "Deselect All" : "Select All"}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {repos.map((repo) => (
          <label
            key={repo.name}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selectedRepos.includes(repo.name)}
              onChange={() => handleToggleRepo(repo.name)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">
                  {repo.name}
                </span>
                {repo.private && (
                  <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    Private
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-sm text-gray-500 truncate">
                  {repo.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
