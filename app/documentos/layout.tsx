import { requireUser } from "@/lib/require-user";

export default async function DocumentosLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
