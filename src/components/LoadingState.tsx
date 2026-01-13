"use client";

interface LoadingStateProps {
  message?: string;
  progress?: {
    current: number;
    total: number;
    currentItem?: string;
  };
}

export function LoadingState({ message = "Loading...", progress }: LoadingStateProps) {
  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : 0;
  const widthStyle = progress ? `${(progress.current / progress.total) * 100}%` : "0%";

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <svg
          className="animate-spin h-12 w-12 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
      {progress && (
        <div className="mt-3 w-64">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>
              {progress.current} of {progress.total}
            </span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: widthStyle }}
            />
          </div>
          {progress.currentItem && (
            <p className="mt-1 text-xs text-gray-500 truncate">
              Processing: {progress.currentItem}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
