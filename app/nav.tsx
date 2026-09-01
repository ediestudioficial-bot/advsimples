import Link from "next/link";
import LogoutButton from "./hoje/logout-button";

const links = [
  { href: "/hoje", label: "Hoje", key: "hoje", icon: "calendar_today" },
  { href: "/clientes", label: "Clientes", key: "clientes", icon: "groups" },
  { href: "/casos", label: "Casos", key: "casos", icon: "work" },
  { href: "/prazos", label: "Prazos", key: "prazos", icon: "event_busy" },
  { href: "/documentos", label: "Docs", key: "documentos", icon: "description" },
];

export default function Nav({ active }: { active: string }) {
  return (
    <>
      {/* Top bar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-40 flex items-center justify-between px-margin-mobile py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            gavel
          </span>
          <span className="font-heading text-lg font-bold text-secondary">ADV Simples</span>
        </div>
        <LogoutButton />
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface-container flex justify-around items-center px-2 py-2 border-t border-outline-variant">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={
              link.key === active
                ? "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl p-1 w-16 h-14 transition"
                : "flex flex-col items-center justify-center text-on-tertiary-container p-1 w-16 h-14 hover:text-secondary transition"
            }
          >
            <span className="material-symbols-outlined text-[20px] mb-0.5">{link.icon}</span>
            <span className="text-[11px] font-heading font-medium tracking-wide">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
