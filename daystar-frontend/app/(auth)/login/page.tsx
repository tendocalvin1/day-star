import Link from "next/link";
import { Sparkles } from "lucide-react";
import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">DayStar</p>
            <p className="text-xs font-medium text-slate-500">Childcare command center</p>
          </div>
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-950">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to manage today&apos;s care with confidence.
            </p>
          </div>
          <LoginForm />
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to DayStar?{" "}
          <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-600">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
