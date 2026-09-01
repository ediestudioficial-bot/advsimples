import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";

async function criarCliente(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;
  const email = formData.get("email") as string;
  await supabase.from("clientes").insert({ nome, telefone: telefone || null, email: email || null });
  revalidatePath("/clientes");
}

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase.from("clientes").select("id, nome, telefone, email, criado_em").order("criado_em", { ascending: false });

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-28">
      <Nav active="clientes" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header>
          <p className="text-secondary text-[11px] uppercase tracking-[.24em] font-semibold mb-2">Relacionamento</p>
          <h1 className="font-heading text-4xl font-bold text-on-surface">Clientes</h1>
          <p className="text-on-surface-variant text-sm mt-2">Dados essenciais organizados e sempre à mão.</p>
        </header>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20"><span className="material-symbols-outlined text-secondary">person_add</span></div>
            <div><h2 className="font-heading text-lg font-semibold text-on-surface">Novo cliente</h2><p className="text-xs text-on-surface-variant">Cadastre só o necessário para começar.</p></div>
          </div>
          <form action={criarCliente} className="space-y-3">
            <input name="nome" required placeholder="Nome completo" className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant" />
            <input name="telefone" placeholder="Telefone (opcional)" className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant" />
            <input name="email" type="email" placeholder="E-mail (opcional)" className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant" />
            <button type="submit" className="w-full bg-secondary text-on-secondary font-heading font-bold py-3 hover:brightness-110 transition">Cadastrar cliente</button>
          </form>
        </section>

        <section className="space-y-3">
          {(clientes ?? []).length === 0 && <div className="card p-7 text-center text-on-surface-variant">Nenhum cliente ainda.</div>}
          {(clientes ?? []).map((c) => (
            <article key={c.id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-secondary">person</span></div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-lg text-on-surface truncate">{c.nome}</h3>
                  <p className="text-sm text-on-surface-variant mt-1 truncate">{c.telefone ?? "sem telefone"}{c.email ? ` · ${c.email}` : ""}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline shrink-0">chevron_right</span>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
