export default function AppointmentsPage() {
  return (
    <main className="flex h-full max-h-screen overflow-hidden min-w-0 w-full flex-col p-4 gap-4 pb-6 md:pb-4">
      <header className="flex flex-wrap items-end justify-between gap-3 pl-12 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="mt-1 text-sm text-foreground/65">Gestión de turnos</p>
        </div>
      </header>
      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.3)] sm:rounded-4xl"></section>
    </main>
  );
}
