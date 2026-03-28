"use client";
import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, Plus } from "lucide-react";

const CATEGORIES = ["sde", "ai", "webdev"];

export function ResumeUpload({ initialResumes }: { initialResumes: any[] }) {
  const [resumes, setResumes] = useState(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [selectedCat, setSelectedCat] = useState("sde");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", selectedCat);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: fd,
      });
      const newResume = await res.json();

      // Auto-parse placeholder for Gemini context
      await fetch("/api/resumes/parse", {
        method: "POST",
        body: JSON.stringify({
          resumeId: newResume.id,
          rawText: `Resume content for ${selectedCat} role...`,
        }),
      });

      setResumes([newResume, ...resumes]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">
          Add Professional Context
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${selectedCat === cat ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="file"
          id="resume-up"
          hidden
          onChange={handleUpload}
          accept=".pdf"
        />
        <label
          htmlFor="resume-up"
          className="w-full h-24 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-500/50 transition-all group"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-indigo-400" />
          ) : (
            <Upload
              size={20}
              className="text-slate-500 group-hover:text-indigo-400"
            />
          )}
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300">
            Upload {selectedCat} Resume
          </span>
        </label>
      </div>

      <div className="grid gap-2">
        {resumes.map((r) => (
          <div
            key={r.id}
            className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded text-indigo-400">
                <FileText size={14} />
              </div>
              <div className="text-xs">
                <p className="text-white font-bold truncate max-w-[120px]">
                  {r.fileName}
                </p>
                <p className="text-indigo-400 font-mono text-[9px] uppercase">
                  {r.category}
                </p>
              </div>
            </div>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
