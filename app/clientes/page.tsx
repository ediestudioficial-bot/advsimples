import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";

async function criarCliente(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;
  const email = formData.get("email") as string;

  await supabase.from("clientes").insert({
    nome,
    telefone: telefone || null,
    email: email || null,
  });

  revalidatePath("/clientes");
}

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Nav active="clientes" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <h1 className="font-heading text-3xl font-bold text-on-surface">Clientes</h1>

        <div className="card border border-outline-variant rounded-lg p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface mb-3">Novo cliente</h2>
          <form action={criarCliente} className="space-y-3">
            <input
              name="nome"
              required
              placeholder="Nome completo"
              className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              name="telefone"
              placeholder="Telefone (opcional)"
              className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              name="email"
              type="email"
              placeholder="E-mail (opcional)"
              className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button
              type="submit"
              className="w-full bg-secondary text-on-secondary font-heading font-semibold rounded-full py-2.5 hover:opacity-90 transition"
            >
              Cadastrar cliente
            </button>
          </form>
        </div>

        <div className="space-y-2">
          {(clientes ?? []).length === 0 && (
            <p className="text-on-surface-variant text-sm">Nenhum cliente ainda.</p>
          )}
          {(clientes ?? []).map((c) => (
            <div
              key={c.id}
              className="card border-l-4 border-secondary-container border-y border-r border-outline-variant rounded-lg p-4"
            >
              <p className="font-heading font-semibold text-on-surface">{c.nome}</p>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">call</span>
                {c.telefone ?? "sem telefone"}
                {c.email ? ` · ${c.email}` : ""}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
