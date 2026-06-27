import { Link as LinkIcon, Shield, FileText, Send } from "lucide-react";
import { BusinessDNA } from "../../types";

export default function Integrations({ dna }: { dna: BusinessDNA }) {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Platform Integrations</h2>
          <p className="text-slate-400 text-sm">NEXUS AI tizimining tashqi servislar bilan aloqasi</p>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-mono text-emerald-500 uppercase block font-bold mb-1">Security Notice</span>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            Barcha API kalitlari (Gemini, my.gov, Soliq) server tomonida `.env` fayllarida xavfsiz saqlanadi. Klient tomonida ochiq kalitlar yo'q.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Telegram Bot */}
         <div className="bg-[#0a0b10] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-[#2AABEE]/50 transition-colors">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#2AABEE]/10 rounded-full blur-2xl group-hover:bg-[#2AABEE]/20 transition-all"></div>
            <div className="w-12 h-12 rounded-xl bg-[#2AABEE]/20 flex items-center justify-center mb-4 relative z-10">
               <Send className="w-6 h-6 text-[#2AABEE]" />
            </div>
            <h3 className="font-bold text-white mb-1">Telegram Bot Integration</h3>
            <p className="text-xs text-slate-400 mb-4">Haftalik hisobotlar va tezkor savol-javoblar uchun @nexus_ai_bot bilan bog'lanish.</p>
            <div className="flex items-center justify-between">
               <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">Status: Ulangan</span>
               <button className="text-xs font-bold text-[#2AABEE] hover:underline">Sozlamalar</button>
            </div>
         </div>

         {/* PDF Export */}
         <div className="bg-[#0a0b10] border border-slate-800 rounded-2xl p-6 hover:border-rose-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4">
               <FileText className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="font-bold text-white mb-1">PDF Pitch & Report</h3>
            <p className="text-xs text-slate-400 mb-4">Biznes rejani va AI tavsiyalarini investorlar uchun rasmiy PDF formatda yuklab olish.</p>
            <div className="flex items-center justify-between">
               <button className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
                 Hujjatni yuklash
               </button>
            </div>
         </div>

         {/* Planned APIs */}
         <div className="bg-[#0a0b10] border border-slate-800 rounded-2xl p-6 md:col-span-2">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
               <LinkIcon className="w-4 h-4 text-slate-400" /> Rasmiy Integratsiyalar (Kelajakdagi)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-[#111] border border-slate-800 rounded-xl p-4 text-center opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <p className="font-bold text-white text-sm">my.gov.uz</p>
                  <p className="text-[10px] text-slate-500 mt-1">Guvohnoma ma'lumotlari</p>
               </div>
               <div className="bg-[#111] border border-slate-800 rounded-xl p-4 text-center opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <p className="font-bold text-white text-sm">Soliq</p>
                  <p className="text-[10px] text-slate-500 mt-1">Moliyaviy oborot</p>
               </div>
               <div className="bg-[#111] border border-slate-800 rounded-xl p-4 text-center opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <p className="font-bold text-blue-400 text-sm">Click / Payme</p>
                  <p className="text-[10px] text-slate-500 mt-1">To'lovlar tahlili</p>
               </div>
               <div className="bg-[#111] border border-slate-800 rounded-xl p-4 text-center opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <p className="font-bold text-emerald-400 text-sm">Alif</p>
                  <p className="text-[10px] text-slate-500 mt-1">Nasiya tahlili</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
