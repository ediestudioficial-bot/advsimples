import { requireUser } from "@/lib/require-user";

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
