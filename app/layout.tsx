import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow Assist Portal",
  description:
    "A demonstration full-stack workflow platform for citizen applications, operator review, and audit trail — wrapping a mock AI service.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
