import { useState } from "react";
import { PieChart, DollarSign, AlertTriangle, Calculator, Sparkles } from "lucide-react";
import { BusinessDNA } from "../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SmartBudget({ dna }: { dna: BusinessDNA }) {
  const [inputs, setInputs] = useState({
    revenue: 0,
    expenses: 0,
    rent: 0,
    salary: 0,
    advertising: 0,
    inventory: 0,
    taxes: 0,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/dna/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, financialInputs: inputs })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) || 0 });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-50 mb-2 flex items-center justify-center gap-2">
          <DollarSign className="text-emerald-500" /> AI Financial Advisor
        </h2>
        <p className="text-zinc-400 text-sm">Oylik moliyaviy ma'lumotlaringizni kiriting va Gemini AI orqali chuqur tahlil oling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl p-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-50 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" /> Oylik Ko'rsatkichlar (UZS)
            </h3>
            
            {Object.keys(inputs).map((key) => (
              <div key={key}>
                <label className="text-xs font-mono text-zinc-500 uppercase block mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <Input 
                  type="number"
                  name={key}
                  value={(inputs as any)[key] || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-50 h-12 focus-visible:ring-emerald-500"
                />
              </div>
            ))}

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all"
            >
              {isGenerating ? <span className="animate-pulse">Tahlil qilinmoqda...</span> : <><Sparkles className="w-4 h-4 mr-2" /> AI Generate</>}
            </Button>
          </CardContent>
        </Card>

        {/* Outputs */}
        <div className="space-y-6">
          {!result && !isGenerating && (
             <Card className="bg-zinc-950 border-zinc-800 shadow-xl h-full flex flex-col items-center justify-center text-zinc-500 text-center p-0">
               <CardContent className="p-6">
                 <PieChart className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                 <p>Ma'lumotlarni kiritib, "AI Generate" tugmasini bosing.</p>
               </CardContent>
             </Card>
          )}

          {isGenerating && (
             <Card className="bg-zinc-950 border-zinc-800 shadow-xl h-full flex flex-col items-center justify-center text-emerald-500 text-center animate-pulse p-0">
               <CardContent className="p-6">
                 <Sparkles className="w-12 h-12 mb-4 mx-auto" />
                 <p>Gemini AI moliyaviy modelingizni tahlil qilmoqda...</p>
               </CardContent>
             </Card>
          )}

          {result && !isGenerating && (
             <>
                <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 shadow-xl p-0">
                  <CardContent className="p-6">
                    <p className="text-xs font-mono text-zinc-400 uppercase mb-2">Profit Estimate</p>
                    <p className={`text-4xl font-black mb-1 ${result.profitEstimate >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {result.profitEstimate?.toLocaleString()} UZS
                    </p>
                    <p className="text-sm text-zinc-300">Cash Flow: <span className="font-bold">{result.cashFlow}</span></p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800 shadow-xl p-0">
                   <CardContent className="p-6">
                     <h4 className="text-sm font-bold text-zinc-50 mb-4">Budget Allocation Analysis</h4>
                     <div className="space-y-3">
                       {result.budgetAllocation?.map((item: any, i: number) => (
                         <div key={i}>
                           <div className="flex justify-between text-xs mb-1">
                             <span className="text-zinc-300">{item.category}</span>
                             <span className={item.status === 'High' ? 'text-rose-400' : 'text-emerald-400'}>{item.status}</span>
                           </div>
                           <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                             <div className={`h-full ${item.status === 'High' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800 shadow-xl p-0">
                   <CardContent className="p-6">
                     <h4 className="text-sm font-bold text-zinc-50 mb-2">Risk & Growth Suggestions</h4>
                     <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg mb-3">
                        <p className="text-xs text-rose-400 font-bold mb-1">Risk Factor: {result.riskLevel}</p>
                        <p className="text-xs text-zinc-300">{result.riskReason}</p>
                     </div>
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                        <p className="text-xs text-emerald-400 font-bold mb-1">Growth Suggestion</p>
                        <p className="text-xs text-zinc-300">{result.growthSuggestion}</p>
                     </div>
                   </CardContent>
                </Card>
             </>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono text-amber-500 uppercase block font-bold mb-1">Disclaimer</span>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Ushbu byudjet taqsimoti AI tomonidan o'rtacha bozor ko'rsatkichlari asosida shakllantirilgan tavsiya hisoblanadi. Kafolat berilmaydi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
