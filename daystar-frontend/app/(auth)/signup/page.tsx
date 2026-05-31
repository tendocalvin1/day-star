import { ShieldCheck, Sparkles, Users } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_460px]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">DayStar</p>
              <p className="text-xs font-medium text-slate-400">Childcare command center</p>
            </div>
          </div>

          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-indigo-100">
              <Users className="h-3.5 w-3.5" />
              Staff onboarding
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight">
                Give your team a cleaner way to run care operations.
              </h1>
              <p className="text-base leading-7 text-slate-300">
                Create an account for managers and caregivers while keeping roles clear, focused, and secure.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="text-sm font-medium text-slate-200">
                Role-based access keeps daily workflows simple.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 lg:mx-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Create account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Set up access for the DayStar workspace.
                </p>
              </div>
            </div>
            <SignupForm />
          </div>
        </section>
      </div>
    </div>
  )
}
