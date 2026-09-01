import { requireUser } from "@/lib/require-user";

export default async function HojeLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
