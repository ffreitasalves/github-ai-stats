"use client";

import { useState } from "react";

interface OrgInputProps {
  onLoadRepos: (org: string) => void;
  isLoading: boolean;
}

export function OrgInput({ onLoadRepos, isLoading }: OrgInputProps) {
  const [org, setOrg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (org.trim()) {
      onLoadRepos(org.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <label htmlFor="org" className="block text-sm font-medium text-gray-700 mb-1">
          GitHub Organization or Username
        </label>
        <input
          type="text"
          id="org"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="e.g., vercel, facebook, microsoft"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          disabled={isLoading}
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={!org.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            "Load Repositories"
          )}
        </button>
      </div>
    </form>
  );
}
