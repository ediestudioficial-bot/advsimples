"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function PremiumSelect({
  name,
  options,
  placeholder = "Selecione",
  defaultValue = "",
}: {
  name: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="premium-select relative">
      <input type="hidden" name={name} value={value} required />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`premium-field premium-select-trigger ${open ? "is-open" : ""}`}
        aria-expanded={open}
      >
        <span className={selected ? "text-on-surface" : "text-on-surface-variant"}>
          {selected?.label ?? placeholder}
        </span>
        <span className={`material-symbols-outlined select-chevron ${open ? "rotate-180" : ""}`}>expand_more</span>
      </button>

      {open && (
        <div className="premium-select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setValue(option.value);
                setOpen(false);
              }}
              className={`premium-select-option ${value === option.value ? "selected" : ""}`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
