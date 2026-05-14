import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const items = [
    { href: "/admin", label: "Overview", icon: "▣" },
    { href: "/admin/queue", label: "Queue", icon: "≣" },
    { href: "/admin/audit", label: "Audit log", icon: "≡" },
  ];

  return (
    <AppShell user={{ name: session.name, role: session.role, email: session.email }} navItems={items}>
      {children}
    </AppShell>
  );
}
