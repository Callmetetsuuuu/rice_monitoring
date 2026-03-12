import { useState } from 'react';
import { FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { fetchAnalyses, type AnalysisWithImage } from '../lib/api';

function analysesToCSV(analyses: AnalysisWithImage[]): string {
  const headers = [
    'Date (analyzed_at)',
    'Health Status',
    'Health Score',
    'Green %',
    'Yellow %',
    'Brown %',
    'Harvest Ready',
    'Recommendations',
  ];
  const rows = analyses.map((a) => [
    a.analyzed_at,
    a.health_status ?? '',
    String(a.health_score ?? ''),
    String(a.green_percentage ?? ''),
    String(a.yellow_percentage ?? ''),
    String(a.brown_percentage ?? ''),
    a.harvest_ready ? 'Yes' : 'No',
    (a.recommendations ?? '').replace(/"/g, '""'),
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\r\n');
  return csvContent;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DocsSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (format: 'csv' | 'json') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyses(500);
      const date = new Date().toISOString().slice(0, 10);
      if (format === 'csv') {
        const csv = analysesToCSV(data);
        downloadBlob(csv, `rice-analysis-${date}.csv`, 'text/csv;charset=utf-8');
      } else {
        const json = JSON.stringify(
          data.map((a) => ({
            id: a.id,
            analyzed_at: a.analyzed_at,
            health_status: a.health_status,
            health_score: a.health_score,
            green_percentage: a.green_percentage,
            yellow_percentage: a.yellow_percentage,
            brown_percentage: a.brown_percentage,
            harvest_ready: a.harvest_ready,
            recommendations: a.recommendations,
          })),
          null,
          2
        );
        downloadBlob(json, `rice-analysis-${date}.json`, 'application/json');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="docs" className="scroll-mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-emerald-800">Docs &amp; Data</h2>
        <p className="mb-6 text-sm text-emerald-700">
          Download your analysis results for records or use in spreadsheets. Data includes health score, color
          percentages, harvest readiness, and recommendations for each captured image.
        </p>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownload('csv')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-5 w-5" />
            )}
            Download as CSV
          </button>
          <button
            onClick={() => handleDownload('json')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileJson className="h-5 w-5" />
            )}
            Download as JSON
          </button>
        </div>
        <p className="mt-4 text-xs text-emerald-600">
          Exports up to 500 most recent analyses. CSV is compatible with Excel and Google Sheets.
        </p>
      </div>
    </section>
  );
}
