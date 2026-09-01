"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full flex items-center justify-center"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
    </button>
  );
}
