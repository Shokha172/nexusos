import { useState } from "react";
import { FlaskConical, ArrowRight, Play } from "lucide-react";
import { BusinessDNA } from "../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ScenarioSimulator({ dna }: { dna: BusinessDNA }) {
  const [scenario, setScenario] = useState("Reklamaga yana 10 mln so'm ajratsam nima bo'ladi?");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      setResult("AI Hisob-kitoblariga ko'ra:\n\n1. Mijozlar oqimi o'rtacha 18% ga oshishi kutiladi.\n2. LTV (Mijozning umrboqiy qiymati) hisobga olinsa, bu xarajat 2.5 oyda qoplanadi.\n3. Risk: Mahalliy bozorda (Tumanda) bu miqdordagi reklamaga javob beradigan auditoriya sig'imi yetarli bo'lmasligi mumkin. Ijtimoiy tarmoqlardagi target qamrovini kengroq olish tavsiya etiladi.");
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50 mb-2">Scenario Simulator</h2>
          <p className="text-zinc-400 text-sm">"What-if" tahlillari va turli biznes ssenariylarini tekshirish</p>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 shadow-xl p-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
               <FlaskConical className="w-5 h-5 text-purple-500" />
             </div>
             <div>
               <h3 className="font-bold text-zinc-50">Ssenariy kiritish</h3>
               <p className="text-xs text-zinc-500">O'zgartirish kiritib natijani prognoz qiling.</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input 
              type="text" 
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="flex-1 bg-zinc-900/50 border-zinc-800 text-zinc-50 h-12 focus-visible:ring-purple-500"
            />
            <Button 
              onClick={handleSimulate}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 px-6 rounded-xl transition-all shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                 <><Play className="w-4 h-4 fill-white mr-2" /> Simulyatsiya</>
              )}
            </Button>
          </div>

          {result && !loading && (
            <div className="p-5 border border-purple-500/30 bg-purple-500/5 rounded-xl animate-fade-in">
               <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                 <ArrowRight className="w-4 h-4" /> Natija Prognozi
               </h4>
               <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
