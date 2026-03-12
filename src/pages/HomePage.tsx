import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { AnalysisResults } from '../components/AnalysisResults';
import InfoModal from '../components/InfoModal';

export function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleCapture = () => setRefreshKey((prev) => prev + 1);
  const handleCameraStart = () => {
    setIsCameraActive(true);
    setSessionStartTime(new Date().toISOString());
  };
  const handleCameraStop = () => setIsCameraActive(false);

  return (
    <>
      <InfoModal isOpen={isInfoOpen} setIsOpen={setIsInfoOpen} />

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
    </>
  );
}
