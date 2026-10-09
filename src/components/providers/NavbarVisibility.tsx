import { headers } from "next/headers";
import Navbar from "../molecules/Navbar";

export default async function NavbarVisibility() {
  const headersList = await headers();

  const hostname = headersList.get("host")?.split(":")[0].toLowerCase();

  const isDash = hostname?.includes("dash.");

  if (isDash) return null;

  return <Navbar />;
}
