"use client";

import { useState } from "react";

interface SummaryReportProps {
  summary: string;
  org: string;
  fromDate: string;
  toDate: string;
  totalPRs: number;
}

export function SummaryReport({
  summary,
  org,
  fromDate,
  toDate,
  totalPRs,
}: SummaryReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${org}-report-${fromDate}-to-${toDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Engineering Report - {org}
          </h2>
          <p className="text-sm text-gray-500">
            {fromDate} to {toDate} | {totalPRs} PRs merged
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download MD
          </button>
        </div>
      </div>
      <div className="p-6 prose prose-sm max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: formatMarkdown(summary),
          }}
        />
      </div>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).trim();
      return `<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm"><code>${code}</code></pre>`;
    })
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    // Unordered lists
    .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/\n/g, '<br />');
}
