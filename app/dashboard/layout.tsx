import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "CITIZEN") redirect("/admin");

  const items = [
    { href: "/dashboard", label: "My applications", icon: "📋" },
    { href: "/dashboard/new", label: "New application", icon: "＋" },
  ];

  return (
    <AppShell user={{ name: session.name, role: session.role, email: session.email }} navItems={items}>
      {children}
    </AppShell>
  );
}
