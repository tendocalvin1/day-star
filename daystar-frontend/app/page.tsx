import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="max-w-xl space-y-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              DayStar
            </h1>
            <p className="mx-auto max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
              A modern childcare management workspace for attendance, child records, and daily care operations.
            </p>
          </div>
          <div className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
