import { Navbar } from "./Navbar";
import { Sidebar, type NavItem } from "./Sidebar";

export function AppShell({
  user,
  navItems,
  children,
}: {
  user?: { name: string; role: string; email: string } | null;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
