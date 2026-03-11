import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle, X, ChevronDown, Clock, Grid3x3, List } from 'lucide-react';
import { fetchAnalyses, AnalysisWithImage } from '../lib/api';

const DISPLAY_LIMIT = 5;
const CAPTURE_TIME_LIMIT_MINS = 20;

export function AnalysisResults({ showLatestOnly = false, isCameraActive = false }: { showLatestOnly?: boolean; isCameraActive?: boolean }) {
  const [analyses, setAnalyses] = useState<AnalysisWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [modalAnalysis, setModalAnalysis] = useState<AnalysisWithImage | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [generalViewMode, setGeneralViewMode] = useState<'all' | '20' | 'current'>('all');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyses();
      setAnalyses(data || []);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  const isWithinCaptureTime = (analyzedAt: string) => {
    const diffMins = (Date.now() - new Date(analyzedAt).getTime()) / 60000;
    return diffMins <= CAPTURE_TIME_LIMIT_MINS;
  };

  const getRecentAnalyses = () => analyses.filter((a) => isWithinCaptureTime(a.analyzed_at));

  const getFilteredAnalysesForGeneral = (mode: 'all' | '20' | 'current') => {
    if (mode === 'current') return analyses.slice(0, 1);
    if (mode === '20') return analyses.slice(0, 20);
    return analyses;
  };

  const calculateGeneralAnalysis = (mode: 'all' | '20' | 'current') => {
    const items = getFilteredAnalysesForGeneral(mode);
    if (!items || items.length === 0) return null;
    let sumHealth = 0;
    let sumGreen = 0;
    let sumYellow = 0;
    let sumBrown = 0;
    let harvestCount = 0;
    const statusCount: Record<string, number> = {};

    items.forEach((it) => {
      sumHealth += Number(it.health_score) || 0;
      sumGreen += Number(it.green_percentage) || 0;
      sumYellow += Number(it.yellow_percentage) || 0;
      sumBrown += Number(it.brown_percentage) || 0;
      if (it.harvest_ready) harvestCount++;
      const s = it.health_status || 'Unknown';
      statusCount[s] = (statusCount[s] || 0) + 1;
    });

    const mostCommonStatus = Object.keys(statusCount).reduce((a, b) => (statusCount[a] >= statusCount[b] ? a : b));

    return {
      avgHealthScore: sumHealth / items.length,
      avgGreen: sumGreen / items.length,
      avgYellow: sumYellow / items.length,
      avgBrown: sumBrown / items.length,
      harvestReadyCount: harvestCount,
      totalImages: items.length,
      mostCommonStatus,
    } as const;
  };

  const getHealthStyles = (status: string) => {
    switch (status) {
      case 'Excellent':
      case 'Healthy':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
      case 'Good':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
      case 'Moderate':
        return { text: 'text-amber-700', bg: 'bg-amber-100 border-amber-300' };
      case 'Poor':
        return { text: 'text-red-700', bg: 'bg-red-100 border-red-300' };
      default:
        return { text: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' };
    }
  };

  const displayedAnalyses = showAll ? analyses : analyses.slice(0, DISPLAY_LIMIT);
  const hasMore = analyses.length > DISPLAY_LIMIT && !showAll;
  const recentAnalyses = getRecentAnalyses();
  const generalAnalysis = calculateGeneralAnalysis(generalViewMode);

  const GeneralAnalysisCard = () => {
    if (!generalAnalysis) return null;

    const statusStyles = getHealthStyles(generalAnalysis.mostCommonStatus);
    const healthLevel =
      generalAnalysis.avgHealthScore >= 75
        ? 'Excellent'
        : generalAnalysis.avgHealthScore >= 50
          ? 'Good'
          : 'Needs Attention';

    return (
      <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white transition hover:border-emerald-400 hover:shadow-md">
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-1 font-semibold text-emerald-800">General Analysis Summary</h3>
              <p className="text-sm text-emerald-600">
                {generalAnalysis.totalImages} image{generalAnalysis.totalImages !== 1 ? 's' : ''} analyzed
              </p>
            </div>
            <span
              className={`inline-flex rounded-lg border px-3 py-1 text-sm font-medium ${statusStyles.bg} ${statusStyles.text}`}
            >
              {generalAnalysis.mostCommonStatus}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Avg Health Score</span>
              </div>
              <p className="text-2xl font-bold text-emerald-800">{generalAnalysis.avgHealthScore.toFixed(0)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <span className="mb-1 block text-xs font-medium text-emerald-600">Green</span>
              <p className="text-2xl font-bold text-emerald-700">{generalAnalysis.avgGreen.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <span className="mb-1 block text-xs font-medium text-amber-600">Yellow</span>
              <p className="text-2xl font-bold text-amber-700">{generalAnalysis.avgYellow.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <span className="mb-1 block text-xs font-medium text-orange-600">Brown</span>
              <p className="text-2xl font-bold text-orange-700">{generalAnalysis.avgBrown.toFixed(1)}%</p>
            </div>
          </div>

          {generalAnalysis.harvestReadyCount > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 p-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                {generalAnalysis.harvestReadyCount} section{generalAnalysis.harvestReadyCount !== 1 ? 's' : ''} ready for harvest
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-emerald-50/50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="mb-1 text-sm font-medium text-emerald-800">Overall Health Status</p>
              <p className="text-sm text-emerald-700">
                {healthLevel}: Your rice plantation shows an average health score of {generalAnalysis.avgHealthScore.toFixed(0)} across {generalAnalysis.totalImages} monitored location{generalAnalysis.totalImages !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AnalysisCard = ({ analysis, onClick, compact = false, showTimeInfo = false }: { analysis: AnalysisWithImage; onClick?: () => void; compact?: boolean; showTimeInfo?: boolean; }) => {
    const styles = getHealthStyles(analysis.health_status);
    const timeSinceCapture = (() => {
      const diff = (new Date().getTime() - new Date(analysis.analyzed_at).getTime()) / (1000 * 60);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${Math.floor(diff)}m ago`;
      return `${Math.floor(diff / 60)}h ago`;
    })();

    return (
      <div
        onClick={onClick}
        className={`overflow-hidden rounded-xl border border-emerald-200 bg-white transition hover:border-emerald-400 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="md:flex">
          {analysis.plant_images && (
            <div className="md:w-1/3">
              <img src={analysis.plant_images.image_data} alt="Rice plant" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="md:w-2/3 p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="mb-1 font-semibold text-emerald-800">{showTimeInfo && recentAnalyses.includes(analysis) ? 'Latest Analysis' : 'Analysis Result'}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-emerald-600">{new Date(analysis.analyzed_at).toLocaleString()}</p>
                  {showTimeInfo && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <Clock className="h-3 w-3" />
                      {timeSinceCapture}
                    </span>
                  )}
                </div>
              </div>
              <span className={`inline-flex rounded-lg border px-3 py-1 text-sm font-medium ${styles.bg} ${styles.text}`}>
                {analysis.health_status}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Health Score</span>
                </div>
                <p className="text-2xl font-bold text-emerald-800">{analysis.health_score}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <span className="mb-1 block text-xs font-medium text-emerald-600">Green</span>
                <p className="text-2xl font-bold text-emerald-700">{analysis.green_percentage.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <span className="mb-1 block text-xs font-medium text-amber-600">Yellow</span>
                <p className="text-2xl font-bold text-amber-700">{analysis.yellow_percentage.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <span className="mb-1 block text-xs font-medium text-orange-600">Brown</span>
                <p className="text-2xl font-bold text-orange-700">{analysis.brown_percentage.toFixed(1)}%</p>
              </div>
            </div>

            {analysis.harvest_ready && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 p-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Ready for harvest</span>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-emerald-50/50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="mb-1 text-sm font-medium text-emerald-800">Recommendations</p>
                <p className={`text-sm text-emerald-700 ${compact ? 'line-clamp-2' : ''}`}>{analysis.recommendations}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ListViewCard = ({ analysis, onClick }: { analysis: AnalysisWithImage; onClick?: () => void }) => {
    const styles = getHealthStyles(analysis.health_status);

    return (
      <tr onClick={onClick} className={`border-b border-emerald-100 transition hover:bg-emerald-50 ${onClick ? 'cursor-pointer' : ''}`}>
        <td className="px-4 py-3">
          <div className="text-sm font-medium text-emerald-800">{new Date(analysis.analyzed_at).toLocaleString()}</div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex rounded-lg border px-3 py-1 text-sm font-medium ${styles.bg} ${styles.text}`}>{analysis.health_status}</span>
        </td>
        <td className="px-4 py-3 text-center"><span className="text-sm font-semibold text-emerald-800">{analysis.health_score}</span></td>
        <td className="px-4 py-3 text-center"><span className="text-sm text-emerald-600">{analysis.green_percentage.toFixed(1)}%</span></td>
        <td className="px-4 py-3 text-center"><span className="text-sm text-amber-600">{analysis.yellow_percentage.toFixed(1)}%</span></td>
        <td className="px-4 py-3 text-center"><span className="text-sm text-orange-600">{analysis.brown_percentage.toFixed(1)}%</span></td>
        <td className="px-4 py-3 text-center">{analysis.harvest_ready ? <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" /> : <span className="text-sm text-gray-400">-</span>}</td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Show general analysis panel
  if (showLatestOnly) {
    if (isCameraActive) {
      return (
        <div className="py-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
          <p className="text-lg font-medium text-emerald-700">Waiting to finish gathering data...</p>
          <p className="mt-2 text-sm text-emerald-600">Stop the camera to generate general analysis</p>
        </div>
      );
    }

    if (!generalAnalysis) {
      return (
        <div className="py-12 text-center">
          <Activity className="mx-auto mb-4 h-16 w-16 text-emerald-300" />
          <p className="text-lg text-emerald-700">No analysis yet</p>
          <p className="mt-2 text-sm text-emerald-600">Capture images to see general analysis</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 p-3">
          <Clock className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">General Analysis - Last updated now</span>
          <div className="flex gap-2 flex-wrap ml-auto">
            <button onClick={() => setGeneralViewMode('all')} className={`flex-1 min-w-max px-3 py-2 rounded-lg text-sm font-medium transition ${generalViewMode === 'all' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
              All Captures
            </button>
            <button onClick={() => setGeneralViewMode('20')} className={`flex-1 min-w-max px-3 py-2 rounded-lg text-sm font-medium transition ${generalViewMode === '20' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
              Last 20
            </button>
            <button onClick={() => setGeneralViewMode('current')} className={`flex-1 min-w-max px-3 py-2 rounded-lg text-sm font-medium transition ${generalViewMode === 'current' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
              Current Image
            </button>
          </div>
        </div>
        <GeneralAnalysisCard />
      </div>
    );
  }

  // Show analysis history list
  if (analyses.length === 0) {
    return (
      <div className="py-12 text-center">
        <Activity className="mx-auto mb-4 h-16 w-16 text-emerald-300" />
        <p className="text-lg text-emerald-700">No analysis results yet</p>
        <p className="mt-2 text-sm text-emerald-600">Capture images with the camera to see health analysis</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-emerald-200 py-3">
          <div className="mb-2 flex gap-2 px-4">
            <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${viewMode === 'card' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
              <Grid3x3 className="h-4 w-4" />
              Card View
            </button>
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {viewMode === 'card' ? (
            <>
              {displayedAnalyses.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} compact onClick={() => setModalAnalysis(analysis)} />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button onClick={() => setShowAll(true)} className="flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-2.5 font-medium text-emerald-800 transition hover:bg-emerald-100">
                    <ChevronDown className="h-5 w-5" />
                    Show All ({analyses.length} total)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-emerald-200">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-800">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-800">Score</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-800">Green</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-800">Yellow</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-800">Brown</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-800">Harvest</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAnalyses.map((analysis) => (
                    <ListViewCard key={analysis.id} analysis={analysis} onClick={() => setModalAnalysis(analysis)} />
                  ))}
                </tbody>
              </table>

              {hasMore && (
                <div className="flex justify-center border-t border-emerald-200 bg-emerald-50 p-3">
                  <button onClick={() => setShowAll(true)} className="flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-white px-5 py-2.5 font-medium text-emerald-800 transition hover:bg-emerald-100">
                    <ChevronDown className="h-5 w-5" />
                    Show All ({analyses.length} total)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalAnalysis(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex justify-end border-b border-emerald-200 bg-white p-3">
              <button onClick={() => setModalAnalysis(null)} className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-100" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <AnalysisCard analysis={modalAnalysis!} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
