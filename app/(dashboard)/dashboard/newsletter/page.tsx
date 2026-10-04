"use client";
import { GetBrevoContacts } from "@/src/actions/BrevoActions";
import { Contact } from "@/src/types/Brevo";
import { useEffect, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

export default function NewsletterDashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadContacts = async () => {
      try {
        const result = await GetBrevoContacts();
        if (!isActive) return;
        setContacts(result.contacts);
        setError(result.error);
      } catch {
        if (isActive) setError("No se pudieron cargar los contactos.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadContacts();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="flex h-full max-h-screen overflow-hidden min-w-0 w-full flex-col gap-4 p-4 pb-6 md:pb-4">
      <header className="flex flex-wrap items-end justify-between gap-3 pl-12 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold">Suscriptores</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Contactos de la newsletter
          </p>
        </div>
        <p className="text-sm font-medium text-foreground/70">
          {contacts.length} {contacts.length === 1 ? "contacto" : "contactos"}
        </p>
      </header>

      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.2)] sm:rounded-4xl p-3">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <ThinkingOrb state="connecting" size={64} theme="light" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : contacts.length === 0 ? (
          <p className="p-6 text-sm text-foreground/65">
            Todavía no hay suscriptores.
          </p>
        ) : (
          <>
            <ul className="h-full overflow-y-auto divide-y divide-black/10 px-3 md:hidden scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-black/0">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex min-w-0 flex-col gap-1 py-3"
                >
                  <span className="break-all text-sm font-semibold">
                    {contact.email ?? "Sin email"}
                  </span>
                  <time className="text-xs text-foreground/65">
                    {new Intl.DateTimeFormat("es", {
                      dateStyle: "medium",
                    }).format(new Date(contact.createdAt))}
                  </time>
                </li>
              ))}
            </ul>
            <div className="hidden h-full overflow-auto md:block">
              <table className="w-full min-w-120 border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-background text-xs uppercase text-foreground/60">
                  <tr>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Email
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Fecha de alta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-5 py-4 font-medium">
                        {contact.email ?? "Sin email"}
                      </td>
                      <td className="px-5 py-4 text-foreground/70">
                        {new Intl.DateTimeFormat("es", {
                          dateStyle: "medium",
                        }).format(new Date(contact.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
