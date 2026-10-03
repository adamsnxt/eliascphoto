import { Sidebar } from "@/src/components/dashboard/molecules";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
