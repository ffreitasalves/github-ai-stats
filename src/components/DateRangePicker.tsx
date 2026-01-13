"use client";

interface DateRangePickerProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: DateRangePickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Date Range
      </label>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor="fromDate" className="block text-xs text-gray-500 mb-1">
            From
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="flex items-end pb-2">
          <span className="text-gray-400">to</span>
        </div>
        <div className="flex-1">
          <label htmlFor="toDate" className="block text-xs text-gray-500 mb-1">
            To
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
