"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // The promise usually doesn't resolve if redirect happens,
    // but good to have error safety.
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4">
      {/* Background decoration (optional subtle glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black relative z-10 p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-900/30 mb-6">
            S
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-sm">
            Sign in to your Job Having account to continue
          </p>
        </div>

        {/* Action Section */}
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
            ) : (
              <>
                <GoogleLogo />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer / Terms */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-600">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline hover:text-zinc-400 transition">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-zinc-400 transition">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper: Accurate Google Logo SVG
function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
