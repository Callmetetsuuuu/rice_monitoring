import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { AnalysisResults } from './components/AnalysisResults';
import Header from './components/Header';
import InfoModal from './components/InfoModal';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleCapture = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-yellow-50/30 to-emerald-100">
      <InfoModal isOpen={isInfoOpen} setIsOpen={setIsInfoOpen} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header onOpenInfo={() => setIsInfoOpen(true)} />

        <div className="mb-10 grid gap-8 lg:grid-cols-2 items-stretch">
          <section>
            <div className="mb-6 rounded-2xl border border-emerald-300 bg-white/85 p-6 shadow-sm h-full">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-xl font-semibold text-emerald-800">Live Camera</h2>
              </div>
              <div className="h-full">
                <CameraCapture onCapture={handleCapture} onCameraStart={() => setIsCameraActive(true)} onCaptureStop={() => setIsCameraActive(false)} />
              </div>
            </div>

            {/* 'How It Works' moved to InfoModal; section removed from main screen */}
          </section>

          <section>
            <div className="rounded-2xl border border-emerald-300 bg-white/85 p-6 shadow-sm h-full">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xl font-semibold text-emerald-800">General Analysis</h2>
              </div>
              <div className="h-full">
                <AnalysisResults key={`general-${refreshKey}`} showLatestOnly={true} isCameraActive={isCameraActive} />
              </div>
            </div>
          </section>
        </div>

        {/* Analysis History full width below */}
        <div className="mt-8">
          <div className="rounded-2xl border border-emerald-300 bg-white/85 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-emerald-800">Analysis History</h2>
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-200 hover:text-emerald-900"
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

        {/* 'Health Status Guide' moved to InfoModal; removed from main screen */}
      </div>
    </div>
  );
}

export default App;
