import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";

async function criarCaso(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const cliente_id = formData.get("cliente_id") as string;
  const titulo = formData.get("titulo") as string;

  await supabase.from("casos").insert({ cliente_id, titulo });

  revalidatePath("/casos");
}

export default async function CasosPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: casos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase
      .from("casos")
      .select("id, titulo, status, criado_em, clientes ( nome )")
      .order("criado_em", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Nav active="casos" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <h1 className="font-heading text-3xl font-bold text-on-surface">Casos</h1>

        <div className="card border border-outline-variant rounded-lg p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface mb-3">Novo caso</h2>

          {(clientes ?? []).length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              Cadastre um cliente primeiro antes de criar um caso.
            </p>
          ) : (
            <form action={criarCaso} className="space-y-3">
              <select
                name="cliente_id"
                required
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Selecione o cliente</option>
                {(clientes ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <input
                name="titulo"
                required
                placeholder="Título do caso (ex: Ação de Cobrança)"
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary font-heading font-semibold rounded-full py-2.5 hover:opacity-90 transition"
              >
                Cadastrar caso
              </button>
            </form>
          )}
        </div>

        <div className="space-y-2">
          {(casos ?? []).length === 0 && (
            <p className="text-on-surface-variant text-sm">Nenhum caso ainda.</p>
          )}
          {(casos ?? []).map((c) => (
            <div
              key={c.id}
              className="card border-l-4 border-primary border-y border-r border-outline-variant rounded-lg p-4"
            >
              <p className="font-heading font-semibold text-on-surface">{c.titulo}</p>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">person</span>
                {(c.clientes as unknown as { nome: string } | null)?.nome ?? "Cliente"} · {c.status}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
