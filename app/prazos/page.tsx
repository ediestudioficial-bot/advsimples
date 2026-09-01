import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";

async function criarPrazo(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const caso_id = formData.get("caso_id") as string;
  const tipo = formData.get("tipo") as string;
  const descricao = formData.get("descricao") as string;
  const data_limite = formData.get("data_limite") as string;

  await supabase.from("prazos").insert({
    caso_id,
    tipo,
    descricao: descricao || null,
    data_limite,
  });

  revalidatePath("/prazos");
  revalidatePath("/hoje");
}

async function marcarConcluido(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("prazos").update({ concluido: true }).eq("id", id);

  revalidatePath("/prazos");
  revalidatePath("/hoje");
}

export default async function PrazosPage() {
  const supabase = await createClient();

  const [{ data: casos }, { data: prazos }] = await Promise.all([
    supabase.from("casos").select("id, titulo, clientes ( nome )").order("titulo"),
    supabase
      .from("prazos")
      .select("id, tipo, descricao, data_limite, concluido, casos ( titulo, clientes ( nome ) )")
      .order("data_limite", { ascending: true }),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Nav active="prazos" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <h1 className="font-heading text-3xl font-bold text-on-surface">Prazos</h1>

        <div className="card border border-outline-variant rounded-lg p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface mb-3">Novo prazo ou audiência</h2>

          {(casos ?? []).length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              Cadastre um caso primeiro antes de criar um prazo.
            </p>
          ) : (
            <form action={criarPrazo} className="space-y-3">
              <select
                name="caso_id"
                required
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Selecione o caso</option>
                {(casos ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {(c.clientes as unknown as { nome: string } | null)?.nome ?? "Cliente"} — {c.titulo}
                  </option>
                ))}
              </select>

              <select
                name="tipo"
                required
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="prazo">Prazo</option>
                <option value="audiencia">Audiência</option>
              </select>

              <input
                name="data_limite"
                type="date"
                required
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              />

              <input
                name="descricao"
                placeholder="Descrição (opcional)"
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
              />

              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary font-heading font-semibold rounded-full py-2.5 hover:opacity-90 transition"
              >
                Cadastrar
              </button>
            </form>
          )}
        </div>

        <div className="space-y-2">
          {(prazos ?? []).length === 0 && (
            <p className="text-on-surface-variant text-sm">Nenhum prazo ainda.</p>
          )}
          {(prazos ?? []).map((p) => (
            <div
              key={p.id}
              className={`card border-l-4 ${
                p.concluido ? "border-outline opacity-50" : "border-secondary"
              } border-y border-r border-outline-variant rounded-lg p-4 flex items-center justify-between`}
            >
              <div>
                <p className="font-heading font-semibold text-on-surface">
                  {(p.casos as unknown as { clientes: { nome: string } | null; titulo: string } | null)?.clientes?.nome ?? "Cliente"}
                  {" — "}
                  {(p.casos as unknown as { titulo: string } | null)?.titulo}
                </p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {p.tipo === "audiencia" ? "Audiência" : "Prazo"} ·{" "}
                  {new Date(p.data_limite + "T00:00:00").toLocaleDateString("pt-BR")}
                  {p.descricao ? ` · ${p.descricao}` : ""}
                </p>
              </div>
              {!p.concluido && (
                <form action={marcarConcluido}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="text-xs text-secondary hover:opacity-80 border border-secondary rounded-full px-3 py-1"
                  >
                    Concluir
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
