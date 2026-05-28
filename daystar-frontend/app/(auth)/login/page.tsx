// app/(auth)/login/page.tsx
// This is the login page for the application. It uses the LoginForm component to render the login form.
import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-daystar-700">DayStar Daycare</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
