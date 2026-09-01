import { createClient } from "@/lib/supabase/server";
import { reportServerError } from "@/lib/report-server-error";
import { revalidatePath } from "next/cache";
import Nav from "../nav";
import PremiumSelect from "../premium-select";

async function criarCaso(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const cliente_id = formData.get("cliente_id") as string;
  const titulo = formData.get("titulo") as string;
  const { error } = await supabase.from("casos").insert({ cliente_id, titulo });
  if (error) { await reportServerError(supabase, "criar_caso", "/casos", error); throw new Error("Não foi possível cadastrar o caso."); }
  revalidatePath("/casos");
}

export default async function CasosPage() {
  const supabase = await createClient();
  const [clientesRes, casosRes] = await Promise.all([
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase.from("casos").select("id, titulo, status, criado_em, clientes ( nome )").order("criado_em", { ascending: false }),
  ]);
  if (clientesRes.error) { await reportServerError(supabase, "listar_clientes_casos", "/casos", clientesRes.error); throw new Error("Não foi possível carregar os casos."); }
  if (casosRes.error) { await reportServerError(supabase, "listar_casos", "/casos", casosRes.error); throw new Error("Não foi possível carregar os casos."); }
  const clientes = clientesRes.data, casos = casosRes.data;
  const opcoes = (clientes ?? []).map((c) => ({ value: c.id, label: c.nome }));

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-28">
      <Nav active="casos" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header><p className="text-secondary text-[11px] uppercase tracking-[.24em] font-semibold mb-2">Carteira</p><h1 className="font-heading text-4xl font-bold text-on-surface">Casos</h1><p className="text-on-surface-variant text-sm mt-2">Cada demanda no lugar certo, ligada ao cliente correto.</p></header>
        <section className="card p-5 sm:p-6"><div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20"><span className="material-symbols-outlined text-secondary">work_history</span></div><div><h2 className="font-heading text-lg font-semibold text-on-surface">Novo caso</h2><p className="text-xs text-on-surface-variant">Vincule a demanda a um cliente.</p></div></div>{opcoes.length===0?<p className="text-on-surface-variant text-sm">Cadastre um cliente primeiro.</p>:<form action={criarCaso} className="space-y-3"><PremiumSelect name="cliente_id" placeholder="Selecione o cliente" options={opcoes}/><input name="titulo" required placeholder="Título do caso (ex: Ação de Cobrança)" className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant"/><button type="submit" className="w-full bg-secondary text-on-secondary font-heading font-bold py-3 hover:brightness-110 transition">Cadastrar caso</button></form>}</section>
        <section className="space-y-3">{(casos??[]).length===0&&<div className="card p-7 text-center text-on-surface-variant">Nenhum caso ainda.</div>}{(casos??[]).map((c)=><article key={c.id} className="card p-5 flex items-center justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] uppercase tracking-wider text-secondary bg-secondary/10 border border-secondary/15 rounded-full px-2.5 py-1">{c.status}</span></div><h3 className="font-heading font-bold text-lg text-on-surface truncate">{c.titulo}</h3><p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1"><span className="material-symbols-outlined text-[17px]">person</span>{(c.clientes as unknown as {nome:string}|null)?.nome??"Cliente"}</p></div><div className="w-11 h-11 shrink-0 rounded-2xl bg-primary-container border border-outline-variant/30 flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-primary">balance</span></div></article>)}</section>
      </main>
    </div>
  );
}
