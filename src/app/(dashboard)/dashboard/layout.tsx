import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
// import { authOptions } from "@src/lib/auth";
import { authOptions } from "@/src/lib/auth";
import { DashboardProvider } from "../providers";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Send,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const session = await getServerSession(authOptions);
  //   if (!session) redirect("/login");
  const session = await getServerSession(authOptions);
  // console.log("userSession:", session);
  if (!session) {
    redirect("/login");
  }
  return (
    <>
      <DashboardProvider user={session.user}>
        <div className="flex min-h-screen bg-[#020617] text-slate-300">
          <aside className="w-64 border-r border-white/5 bg-[#020617] flex flex-col shrink-0">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                R
              </div>
              <span className="font-bold text-white tracking-tighter">
                RESUMEFLOW
              </span>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard size={18} />}
                label="Overview"
                active
              />
              <NavItem
                href="/dashboard/resumes"
                icon={<FileText size={18} />}
                label="Resumes"
              />
              <NavItem
                href="/dashboard/campaigns"
                icon={<Send size={18} />}
                label="Campaigns"
              />
              <NavItem
                href="/dashboard/settings"
                icon={<Settings size={18} />}
                label="Settings"
              />
            </nav>
            <div className="p-4 border-t border-white/5 space-y-4">
              {/* <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
              {session.user?.image ? (
                <img src={session.user.image} alt="" />
              ) : (
                <User size={16} className="m-2" />
              )}
            </div>
            <div className="text-xs truncate">
              <p className="text-white font-medium truncate">
                {session.user?.name}
              </p>
              <p className="text-slate-500 truncate">{session.user?.email}</p>
            </div>
          </div> */}
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-400/5 rounded-md transition-colors"
              >
                <LogOut size={16} /> LOGOUT_SESSION
              </Link>
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </DashboardProvider>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${active ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
    >
      {icon} {label}
    </Link>
  );
}
