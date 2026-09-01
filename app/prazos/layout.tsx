import { requireUser } from "@/lib/require-user";

export default async function PrazosLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
