import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";

function limparTelefone(telefone: string | null) {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

async function adicionarDocumento(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const caso_id = formData.get("caso_id") as string;
  const nome_documento = formData.get("nome_documento") as string;

  await supabase.from("documentos").insert({ caso_id, nome_documento });

  revalidatePath("/documentos");
}

async function marcarRecebido(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("documentos").update({ recebido: true }).eq("id", id);

  revalidatePath("/documentos");
}

type CasoComDocs = {
  id: string;
  titulo: string;
  clientes: { nome: string; telefone: string | null } | null;
  documentos: { id: string; nome_documento: string; recebido: boolean }[];
};

export default async function DocumentosPage() {
  const supabase = await createClient();

  const [{ data: casos }, { data: casosComDocs }] = await Promise.all([
    supabase.from("casos").select("id, titulo, clientes ( nome )").order("titulo"),
    supabase
      .from("casos")
      .select("id, titulo, clientes ( nome, telefone ), documentos ( id, nome_documento, recebido )")
      .order("titulo")
      .returns<CasoComDocs[]>(),
  ]);

  const casosComPendencias = (casosComDocs ?? []).filter(
    (c) => c.documentos && c.documentos.length > 0
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Nav active="documentos" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <h1 className="font-heading text-3xl font-bold text-on-surface">Documentos</h1>

        <div className="card border border-outline-variant rounded-lg p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface mb-3">Solicitar documento</h2>

          {(casos ?? []).length === 0 ? (
            <p className="text-on-surface-variant text-sm">Cadastre um caso primeiro.</p>
          ) : (
            <form action={adicionarDocumento} className="space-y-3">
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
              <input
                name="nome_documento"
                required
                placeholder="Nome do documento (ex: RG, Comprovante de residência)"
                className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary font-heading font-semibold rounded-full py-2.5 hover:opacity-90 transition"
              >
                Adicionar à lista
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {casosComPendencias.length === 0 && (
            <p className="text-on-surface-variant text-sm">Nenhum documento cadastrado ainda.</p>
          )}

          {casosComPendencias.map((caso) => {
            const pendentes = caso.documentos.filter((d) => !d.recebido);
            const telefone = limparTelefone(caso.clientes?.telefone ?? null);
            const mensagem =
              pendentes.length > 0
                ? `Olá, ${caso.clientes?.nome ?? ""}! Ainda precisamos dos seguintes documentos para prosseguir com "${caso.titulo}": ${pendentes
                    .map((d) => d.nome_documento)
                    .join(", ")}.`
                : "";
            const linkWhatsApp = telefone
              ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
              : null;

            return (
              <div key={caso.id} className="card border border-outline-variant rounded-lg p-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <p className="font-heading font-semibold text-on-surface">
                    {caso.clientes?.nome ?? "Cliente"} — {caso.titulo}
                  </p>
                  {pendentes.length > 0 && linkWhatsApp && (
                    <a
                      href={linkWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-secondary text-on-secondary rounded-full px-3 py-1.5 font-heading font-medium hover:opacity-90 transition"
                    >
                      Solicitar pelo WhatsApp
                    </a>
                  )}
                  {pendentes.length > 0 && !linkWhatsApp && (
                    <span className="text-xs text-on-surface-variant">
                      Cadastre o telefone para cobrar pelo WhatsApp
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {caso.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm py-1">
                      <span className={doc.recebido ? "text-on-surface-variant line-through" : "text-on-surface"}>
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                          {doc.recebido ? "check_circle" : "warning"}
                        </span>
                        {doc.nome_documento}
                      </span>
                      {!doc.recebido && (
                        <form action={marcarRecebido}>
                          <input type="hidden" name="id" value={doc.id} />
                          <button
                            type="submit"
                            className="text-xs text-secondary border border-secondary rounded-full px-2 py-0.5 hover:opacity-80"
                          >
                            Recebido
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
