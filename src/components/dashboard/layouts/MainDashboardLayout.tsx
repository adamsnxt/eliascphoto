export const MainDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <main className="flex h-full max-h-screen min-h-0 min-w-0 w-full flex-col gap-4 overflow-hidden p-4 pb-6 md:gap-5 md:pb-4">
      {children}
    </main>
  );
};

export default MainDashboardLayout;
