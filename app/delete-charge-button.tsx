"use client";
export default function DeleteChargeButton({action,id}:{action:(formData:FormData)=>void;id:string}){
 return <form action={action} onSubmit={e=>{if(!window.confirm("Excluir esta cobrança? Esta ação não pode ser desfeita."))e.preventDefault();}}>
  <input type="hidden" name="id" value={id}/>
  <button className="h-[42px] px-3 rounded-xl border border-error/25 bg-error/10 text-error text-xs font-semibold">Excluir</button>
 </form>;
}