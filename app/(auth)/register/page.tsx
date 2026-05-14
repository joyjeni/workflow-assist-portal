import { RegisterForm } from "@/components/forms/RegisterForm";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-muted text-sm mt-1">
          Citizens can create an account to submit and track applications.
        </p>
        <div className="card p-5 mt-6">
          <RegisterForm />
        </div>
        <p className="text-sm text-muted mt-4">
          Already have an account? <Link href="/login" className="text-primary underline">Login</Link>
        </p>
      </main>
    </div>
  );
}
