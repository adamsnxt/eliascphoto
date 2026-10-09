import React from "react";

export const SectionDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.3)] dark:shadow-[0_0_10px_0px_rgba(0,0,0,0.8)] sm:rounded-4xl p-4">
      {children}
    </section>
  );
};

export default SectionDashboardLayout;
