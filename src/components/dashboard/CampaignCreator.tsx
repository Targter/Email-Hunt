"use client";
import { useState } from "react";
import {
  Zap,
  Plus,
  X,
  Briefcase,
  Mail,
  Building2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Job {
  company: string;
  title: string;
  email: string;
  text: string;
}

export function BulkCampaignCreator({ resumes }: { resumes: any[] }) {
  const [loading, setLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("auto");
  const [jobs, setJobs] = useState<Job[]>([
    { company: "", title: "", email: "", text: "" },
  ]);

  // --- ADDED HANDLERS ---
  const addJob = () =>
    setJobs([...jobs, { company: "", title: "", email: "", text: "" }]);

  const removeJob = (idx: number) => {
    if (jobs.length > 1) setJobs(jobs.filter((_, i) => i !== idx));
  };

  const updateJob = (idx: number, field: keyof Job, val: string) => {
    setJobs(jobs.map((job, i) => (i === idx ? { ...job, [field]: val } : job)));
  };

  const execute = async () => {
    // Basic Validation
    if (jobs.some((j) => !j.email || !j.text)) {
      alert(
        "Please fill in the Recruiter Email and Job Description for all entries.",
      );
      return;
    }

    setLoading(true);
    try {
      console.log("jobs:", jobs);
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Campaign_${new Date().toLocaleDateString()}`,
          resumeId: selectedResumeId,
          jobDescriptions: jobs,
        }),
      });

      console.log("here is the resume response:", res);

      if (res.ok) {
        // window.location.href = "/dashboard/monitor";
        console.log("responsoe Okay:");
      } else {
        const err = await res.json();
        alert(err.error || "Execution failed");
      }
    } catch (e) {
      alert("Network error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Selector Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-sm">
            Select Context Strategy
          </h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">
            How should we pick the resume?
          </p>
        </div>
        <select
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
          className="bg-slate-950 text-white text-xs border border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="auto">✨ AI Smart Match (Automatic)</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              📄 {r.category || "General"} - {r.fileName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
          Target Nodes
        </h2>
        <button
          onClick={addJob}
          className="text-indigo-400 text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> ADD_ROLE
        </button>
      </div>

      {/* --- FIXED LOOP WITH INPUTS --- */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="relative p-5 bg-slate-900/50 border border-slate-800 rounded-xl group transition-all hover:border-slate-700"
          >
            <button
              onClick={() => removeJob(i)}
              className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <JobInput
                icon={<Building2 size={14} />}
                placeholder="Company"
                value={job.company}
                onChange={(v) => updateJob(i, "company", v)}
              />
              <JobInput
                icon={<Briefcase size={14} />}
                placeholder="Role"
                value={job.title}
                onChange={(v) => updateJob(i, "title", v)}
              />
              <JobInput
                icon={<Mail size={14} />}
                placeholder="Recruiter Email"
                value={job.email}
                onChange={(v) => updateJob(i, "email", v)}
              />
            </div>

            <textarea
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
              placeholder="Paste Job Description here..."
              value={job.text}
              onChange={(e) => updateJob(i, "text", e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={execute}
        disabled={loading || jobs[0].text.length < 5}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/10"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <Sparkles size={18} /> LAUNCH AUTONOMOUS CAMPAIGN
          </>
        )}
      </button>
    </div>
  );
}

// Reusable Small Input Component
function JobInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
        {icon}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
      />
    </div>
  );
}
