"use client";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
export function LiveMetrics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 10000);
    return () => clearInterval(timer);
  }, []);
  const getCount = (status: string) =>
    data?.stats?.find((s: any) => s.status === status)?._count || 0;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Sent"
          value={getCount("sent")}
          icon={<CheckCircle size={16} className="text-emerald-500" />}
        />
        <MetricCard
          label="In Queue"
          value={getCount("queued")}
          icon={<Clock size={16} className="text-indigo-500" />}
        />
        <MetricCard
          label="Processing"
          value={getCount("processing")}
          icon={
            <RefreshCcw
              size={16}
              className="text-amber-500 animate-spin-slow"
            />
          }
        />
        <MetricCard
          label="Failed"
          value={getCount("failed")}
          icon={<AlertTriangle size={16} className="text-red-500" />}
        />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 size={16} /> Execution Log
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Live Telemetry
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recentLogs?.map((log: any) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {log.jobDescription.companyName}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {log.jobDescription.roleTitle}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={log.status} error={log.errorMessage} />
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleTimeString()
                      : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status, error }: { status: string; error?: string }) {
  const styles: Record<string, string> = {
    sent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    queued: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <div className="group relative w-fit">
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter ${styles[status] || styles.queued}`}
      >
        {status}
      </span>
      {error && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-black border border-slate-700 text-[10px] text-slate-400 rounded shadow-xl z-50">
          {error}
        </div>
      )}
    </div>
  );
}
