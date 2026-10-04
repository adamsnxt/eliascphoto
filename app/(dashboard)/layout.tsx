import { Sidebar } from "@/src/components/dashboard/molecules";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="h-full min-h-0 max-h-screen min-w-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
