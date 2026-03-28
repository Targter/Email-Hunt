import Link from "next/link";
// import { authOptions } from "@/lib/auth";
import {
  Cpu,
  Zap,
  Shield,
  Target,
  BarChart3,
  Mail,
  ArrowRight,
  Activity,
} from "lucide-react";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 selection:bg-indigo-500/30 font-sans antialiased">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold tracking-tighter">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <Cpu size={12} />
            </div>
            RESUMEFLOW
          </div>
          <div className="flex items-center gap-5 text-[13px] font-medium">
            <Link href="#engine" className="hover:text-white transition-colors">
              Engine
            </Link>
            <Link
              href="#infrastructure"
              className="hover:text-white transition-colors"
            >
              Stack
            </Link>

            <Link
              href={"/dashboard"}
              className="bg-white text-black px-3 py-1 rounded-sm hover:bg-slate-200 transition-all"
            >
              DASHBOARD
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <section className="pt-24 pb-12 px-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold uppercase mb-4 tracking-widest">
              <Activity size={10} /> System Status: Operational
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
              AI-DRIVEN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                OUTREACH ENGINE.
              </span>
            </h1>
            <p className="text-base text-slate-500 mb-8 max-w-xl leading-snug">
              High-frequency job application automation. Distributed BullMQ
              workers, LLM-based resume alignment, and native Gmail OAuth
              integration. Built for scale.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="h-10 px-6 bg-indigo-600 text-white text-sm font-bold rounded flex items-center gap-2 hover:bg-indigo-500 transition-all"
              >
                EXECUTE CAMPAIGN <ArrowRight size={16} />
              </Link>
              <div className="h-10 px-4 border border-slate-800 rounded flex items-center text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
                Latency: &lt;450ms
              </div>
            </div>
          </div>
        </section>
        <section
          id="engine"
          className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-px bg-white/5 border-x border-white/5"
        >
          <GridCard
            icon={<Target size={18} />}
            title="LLM ALIGNMENT"
            desc="Vector-based JD analysis for semantic resume tailoring."
          />
          <GridCard
            icon={<Zap size={18} />}
            title="DISTRIBUTED QUEUE"
            desc="BullMQ + Redis architecture for fault-tolerant execution."
          />
          <GridCard
            icon={<Mail size={18} />}
            title="NATIVE DELIVERY"
            desc="Direct Gmail API egress ensures maximum inbox penetration."
          />
          <GridCard
            icon={<BarChart3 size={18} />}
            title="RATE CONTROL"
            desc="Dynamic jitter and scheduling to mitigate spam detection."
          />
        </section>
        <section id="infrastructure" className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase">
                Production-Grade Infrastructure
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Our system abstracts the complexity of modern job hunting. From
                PDF parsing to automated retries, we handle the entire lifecycle
                of professional outreach.
              </p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                <TechItem label="Next.js 14 (App Router)" />
                <TechItem label="Prisma + PostgreSQL" />
                <TechItem label="Redis/BullMQ Cluster" />
                <TechItem label="Docker + Caddy Proxy" />
                <TechItem label="OpenAI API Integration" />
                <TechItem label="S3 Document Storage" />
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg font-mono text-[11px] leading-tight overflow-hidden">
              <div className="flex gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="text-indigo-400">
                class OutreachWorker extends Worker {"{"}
              </div>
              <div className="pl-4 text-slate-300">
                async process(job: Job) {"{"}
              </div>
              <div className="pl-8 text-slate-500">
                // Fetching context-aware JD alignment
              </div>
              <div className="pl-8 text-slate-300">
                const context = await prisma.resume.findFirst(...)
              </div>
              <div className="pl-8 text-slate-300">
                const content = await openai.generate(context)
              </div>
              <div className="pl-8 text-slate-500">
                // Executing native Gmail API egress
              </div>
              <div className="pl-8 text-indigo-400">
                await gmail.send(content)
              </div>
              <div className="pl-4 text-slate-300">{"}"}</div>
              <div className="text-indigo-400">{"}"}</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/5 py-8 bg-[#010409]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600">
          <div>BUILD: 2024.Q1.V1</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-slate-400">
              API_DOCS
            </Link>
            <Link href="#" className="hover:text-slate-400">
              SYSTEM_LOGS
            </Link>
            <Link href="#" className="hover:text-slate-400">
              PRIVACY_MD
            </Link>
          </div>
          <div>RESUMEFLOW_INSTANCE_01</div>
        </div>
      </footer>
    </div>
  );
}

function GridCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-[#020617] p-6 hover:bg-slate-900/50 transition-colors border-b md:border-b-0">
      <div className="text-indigo-500 mb-4">{icon}</div>
      <div className="text-white text-xs font-bold mb-2 tracking-widest uppercase">
        {title}
      </div>
      <div className="text-[12px] text-slate-500 leading-snug">{desc}</div>
    </div>
  );
}

function TechItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 tracking-tight">
      <Shield size={10} className="text-indigo-600" /> {label}
    </div>
  );
}
