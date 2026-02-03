
import React from 'react';
import { CoachSummary } from '../types';

interface DashboardProps {
  summary: Partial<CoachSummary> | null;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, isLoading }) => {
  if (!summary && !isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">対話を通じて整理します</h3>
        <p className="text-sm text-slate-500">
          コーチとの会話が進むと、ここにあなたの現状と具体的なアクションが整理されます。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full overflow-y-auto space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
        コーチング・サマリー
      </h2>

      {isLoading && (
        <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">整理中...</span>
        </div>
      )}

      {summary?.currentIssues && (
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">現状の課題</h3>
          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">{summary.currentIssues}</p>
        </section>
      )}

      {summary?.idealState && (
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">理想の状態</h3>
          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">{summary.idealState}</p>
        </section>
      )}

      {summary?.gap && (
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ギャップの整理</h3>
          <p className="text-slate-700 bg-indigo-50 p-3 rounded-lg text-sm border border-indigo-100">{summary.gap}</p>
        </section>
      )}

      {summary?.leveragePoints && (
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">注力ポイント</h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {(Array.isArray(summary.leveragePoints) ? summary.leveragePoints : [summary.leveragePoints]).map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {summary?.actionFlow && (
        <section className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            今週のアクション
          </h3>
          <p className="text-slate-800 text-sm font-medium whitespace-pre-wrap">{summary.actionFlow}</p>
        </section>
      )}
    </div>
  );
};
