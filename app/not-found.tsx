import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted mt-2">The page you are looking for does not exist.</p>
        <Link href="/" className="btn btn-primary mt-6">Back to home</Link>
      </main>
    </div>
  );
}
