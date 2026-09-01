import Image from "next/image";
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
      <header className="premium-topbar sticky top-0 z-40 flex items-center justify-between px-margin-mobile py-3">
        <div className="flex items-center gap-3">
          <Image src="/adv-simples-mark.svg" alt="ADV Simples" width={36} height={36} className="premium-brand-mark" priority />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-[17px] font-bold tracking-tight text-on-surface">ADV <span className="text-secondary">Simples</span></span>
            <span className="text-[9px] uppercase tracking-[.22em] text-on-surface-variant mt-1">Seu escritório sob controle</span>
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low/70 shadow-lg px-1">
          <LogoutButton />
        </div>
      </header>

      <nav className="premium-bottom-nav fixed z-50 flex justify-around items-center px-2 py-2">
        {links.map((link) => {
          const activeItem = link.key === active;
          return (
            <Link
              key={link.key}
              href={link.href}
              className={`nav-item ${activeItem ? "active" : ""} flex flex-col items-center justify-center p-1 w-16 h-14`}
            >
              <span className="material-symbols-outlined text-[21px] mb-0.5" style={{ fontVariationSettings: activeItem ? "'FILL' 1" : "'FILL' 0" }}>
                {link.icon}
              </span>
              <span className="text-[10px] font-heading font-semibold tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
