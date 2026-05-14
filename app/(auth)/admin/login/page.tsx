import { LoginForm } from "@/components/forms/LoginForm";
import { Navbar } from "@/components/Navbar";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Operator / Admin login</h1>
        <p className="text-muted text-sm mt-1">
          Sign in with operator credentials to review the application queue.
        </p>
        <div className="card p-5 mt-6">
          <LoginForm redirectTo="/admin" expectedRole="ADMIN" />
        </div>
        <p className="text-xs text-faint mt-3">
          Demo: <code className="font-mono">admin@portal.local</code> / <code className="font-mono">Demo@1234</code>
        </p>
      </main>
    </div>
  );
}
