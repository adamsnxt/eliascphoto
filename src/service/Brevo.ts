import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const Brevo = {
  addContact: async (email: string) => {
    return await client.contacts.createContact({
      email,
      listIds: [5],
    });
  },
  getAllContacts: async () => {
    const { contacts } = await client.contacts.getContacts({
      listIds: [5],
    });
    return contacts.map((contact) => ({
      id: contact.id,
      email: contact.email ?? null,
      createdAt: contact.createdAt,
    }));
  },
};
