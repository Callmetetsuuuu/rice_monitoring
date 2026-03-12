import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { AnalysisResults } from './components/AnalysisResults';
import { DocsSection } from './components/DocsSection';
import { AboutSection } from './components/AboutSection';
import Header from './components/Header';
import InfoModal from './components/InfoModal';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const handleCapture = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCameraStart = () => {
    setIsCameraActive(true);
    setSessionStartTime(new Date().toISOString());
  };

  const handleCameraStop = () => {
    setIsCameraActive(false);
  };

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-yellow-50/30 to-emerald-50">
      <InfoModal isOpen={isInfoOpen} setIsOpen={setIsInfoOpen} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header onOpenInfo={() => setIsInfoOpen(true)} />

        {/* Analysis: intro and anchor for nav */}
        <section id="analysis" className="scroll-mt-8 mb-6">
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-emerald-800">Analysis</h2>
            <p className="text-sm text-emerald-700">
              View analysis results, summary, and history below. <strong>General Analysis</strong> shows aggregated
              health for the current session, last 20 minutes, or all captures. <strong>Analysis History</strong> lists
              every captured image with health score, color breakdown, and recommendations.
            </p>
          </div>
        </section>

        <div className="mb-10 grid gap-8 lg:grid-cols-2 items-stretch">
          <section>
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm h-full">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-xl font-semibold text-emerald-800">Live Camera</h2>
              </div>
              <div className="h-full">
                <CameraCapture
                  onCapture={handleCapture}
                  onCameraStart={handleCameraStart}
                  onCaptureStop={handleCameraStop}
                />
              </div>
            </div>

            {/* 'How It Works' moved to InfoModal; section removed from main screen */}
          </section>

          <section>
            <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm h-full">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xl font-semibold text-emerald-800">General Analysis</h2>
              </div>
              <div className="h-full">
                <AnalysisResults
                  key={`general-${refreshKey}`}
                  showLatestOnly={true}
                  isCameraActive={isCameraActive}
                  sessionStartTime={sessionStartTime}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Analysis History full width below */}
        <div className="mt-8">
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-emerald-800">Analysis History</h2>
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <AnalysisResults key={refreshKey} />
            </div>
          </div>
        </div>

        {/* Docs: downloadable analysis data */}
        <div className="mt-8">
          <DocsSection />
        </div>

        {/* About: how it works and system summary */}
        <div className="mt-8">
          <AboutSection onOpenHowItWorks={() => setIsInfoOpen(true)} />
        </div>

        {/* 'Health Status Guide' moved to InfoModal; removed from main screen */}
      </div>
    </div>
  );
}

export default App;
