type Props = {
  onOpenHowItWorks?: () => void;
};

export function AboutSection({ onOpenHowItWorks }: Props) {
  return (
    <section id="about" className="scroll-mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-emerald-800">About Rice Plant Health Monitor</h2>
        <p className="mb-4 text-sm text-emerald-700">
          This web system helps you monitor rice crop health in the field using your device&apos;s camera. Capture
          images of rice plants to get instant RGB-based health analysis, harvest readiness hints, and actionable
          recommendations.
        </p>

        <h3 className="mb-2 text-base font-medium text-emerald-800">What this system does</h3>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-emerald-700">
          <li>Live camera capture with optional auto-capture every 5 seconds</li>
          <li>Color analysis (green, yellow, brown) to estimate plant condition</li>
          <li>Health score (0–100) and status: Healthy, Moderate, or Poor</li>
          <li>General analysis by session, last 20 minutes, or all captures</li>
          <li>Full analysis history and downloadable data (CSV/JSON) in Docs</li>
        </ul>

        <h3 className="mb-2 text-base font-medium text-emerald-800">How it works</h3>
        <p className="mb-4 text-sm text-emerald-700">
          Each captured image is analyzed by measuring the proportion of green, yellow, and brown pixels. Higher
          green suggests healthy growth; more yellow can mean ripening or stress; brown may indicate disease or
          nutrient issues. The system combines these into a single health score and suggests whether plants may be
          ready for harvest.
        </p>

        <button
          onClick={onOpenHowItWorks}
          className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
        >
          Open &quot;How it works&quot; guide
        </button>
      </div>
    </section>
  );
}
