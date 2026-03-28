import { LiveMetrics } from "@/src/components/dashboard/LiveMetrics";
export default function MonitorPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          System Monitor
        </h1>
        <p className="text-slate-500 text-xs">
          Real-time outreach telemetry and queue observability.
        </p>
      </header>
      <LiveMetrics />
    </div>
  );
}
