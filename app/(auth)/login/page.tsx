import { LoginForm } from "@/components/forms/LoginForm";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Citizen login</h1>
        <p className="text-muted text-sm mt-1">
          Sign in to view your applications and start a new one.
        </p>
        <div className="card p-5 mt-6">
          <LoginForm redirectTo="/dashboard" />
        </div>
        <p className="text-sm text-muted mt-4">
          Need an account? <Link href="/register" className="text-primary underline">Register</Link>
        </p>
        <p className="text-xs text-faint mt-2">
          Demo: <code className="font-mono">citizen1@portal.local</code> / <code className="font-mono">Demo@1234</code>
        </p>
      </main>
    </div>
  );
}
