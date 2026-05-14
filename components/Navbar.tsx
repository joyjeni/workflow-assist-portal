import Link from "next/link";
import { Logo } from "./Logo";

export function Navbar({
  user,
}: {
  user?: { name: string; role: string; email: string } | null;
}) {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold tracking-tight">
            Workflow Assist Portal
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden sm:inline text-muted">
                {user.name} · {user.role.toLowerCase()}
              </span>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="btn btn-secondary"
              >
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-ghost" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Citizen login
              </Link>
              <Link href="/admin/login" className="btn btn-secondary">
                Admin login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
