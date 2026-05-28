import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-daystar-700">DayStar Daycare</h2>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg shadow space-y-6">
          <p className="text-center text-gray-500">Signup coming soon</p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
