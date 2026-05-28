import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-daystar-700">DayStar Daycare</h1>
          <p className="mt-4 text-lg text-gray-600">
            Professional daycare management platform
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link href="/login">
            <Button className="w-full text-lg py-6">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full text-lg py-6">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
