import { requireUser } from "@/lib/require-user";

export default async function ClientesLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
