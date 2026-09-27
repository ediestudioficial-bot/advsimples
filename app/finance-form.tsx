"use client";

import { useState } from "react";
import PremiumSelect from "./premium-select";

type Opt={value:string;label:string};

export default function FinanceForm({action,clientes,casos}:{action:(formData:FormData)=>void;clientes:Opt[];casos:Opt[]}){
 const [parcelado,setParcelado]=useState(false);
 return <form action={action} className="space-y-3">
  <PremiumSelect name="cliente_id" placeholder="Cliente" options={clientes}/>
  <PremiumSelect name="caso_id" placeholder="Caso (opcional)" options={[{value:"",label:"Sem caso vinculado"},...casos]}/>
  <input name="descricao" required placeholder="Ex.: Honorários contratuais" className="px-4 py-3"/>
  <div className="grid grid-cols-2 gap-3"><input name="valor" inputMode="decimal" required placeholder={parcelado?"Valor total":"Valor"} className="px-4 py-3"/><input name="vencimento" type="date" required className="px-4 py-3"/></div>
  <label className="card flex items-center justify-between gap-4 p-4 cursor-pointer">
   <div><p className="font-semibold text-on-surface text-sm">Pagamento parcelado</p><p className="text-xs text-on-surface-variant mt-1">O ADV Simples cria os vencimentos mensais automaticamente.</p></div>
   <span className={"relative w-12 h-7 rounded-full transition "+(parcelado?"bg-secondary":"bg-outline-variant/50")}><input type="checkbox" name="parcelado" value="sim" checked={parcelado} onChange={e=>setParcelado(e.target.checked)} className="sr-only"/><span className={"absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all "+(parcelado?"left-6":"left-1")}/></span>
  </label>
  {parcelado&&<div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4"><label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quantidade de parcelas</label><input name="parcelas" type="number" min="2" max="60" defaultValue="2" required className="mt-2 px-4 py-3 w-full"/><p className="text-xs text-on-surface-variant mt-2">A data acima será o vencimento da 1ª parcela. As demais serão mensais.</p></div>}
  <input name="observacao" placeholder="Observação (opcional)" className="px-4 py-3"/>
  <button className="w-full bg-secondary text-on-secondary font-heading font-bold py-3">{parcelado?"Criar parcelamento":"Cadastrar cobrança"}</button>
 </form>;
}