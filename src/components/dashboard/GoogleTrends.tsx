import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart, Sparkles } from "lucide-react";
import { BusinessDNA } from "../../types";
import { Card, CardContent } from "@/components/ui/card";

export default function GoogleTrends({ dna }: { dna: BusinessDNA }) {
  const [trends, setTrends] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch("/api/dna/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dna })
        });
        const data = await res.json();
        setTrends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, [dna]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50 mb-2">Trend Analysis</h2>
          <p className="text-zinc-400 text-sm">"{dna.industry || 'Biznes'}" bo'yicha qidiruv trendlari ({dna.district || 'Uzbekistan'})</p>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 p-0 relative min-h-[300px] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-emerald-500">
            <Sparkles className="w-8 h-8 mb-2 animate-spin" />
            <p className="text-sm font-bold">Trendlar tahlil qilinmoqda...</p>
          </div>
        )}

        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-50 font-bold">Google Trends (AI Simulated)</p>
                <p className="text-xs text-zinc-400">So'nggi 12 oy</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-bold text-lg flex items-center gap-1 justify-end ${
                trends?.status === "O'smoqda" ? "text-emerald-400" :
                trends?.status === "Pasaymoqda" ? "text-rose-400" : "text-amber-400"
              }`}>
                {trends?.status === "O'smoqda" && <TrendingUp className="w-5 h-5" />}
                {trends?.status === "Pasaymoqda" && <TrendingDown className="w-5 h-5" />}
                {trends?.status === "Barqaror" && <Minus className="w-5 h-5" />}
                {trends?.status || "--"}
              </span>
              <span className="text-xs text-zinc-500">Talab {trends?.growthPercent > 0 ? '+' : ''}{trends?.growthPercent || 0}% o'zgargan</span>
            </div>
          </div>

          {/* Dynamic Chart */}
          <div className="h-48 w-full border-b border-l border-zinc-800 relative flex items-end justify-between px-2 pb-0 pt-8">
             {/* Grid lines */}
             <div className="absolute top-0 left-0 w-full h-px bg-zinc-800/50"></div>
             <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800/50"></div>

             {/* Bars */}
             {trends?.data?.map((h: number, i: number) => (
               <div key={i} className="w-8 md:w-12 bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm relative group cursor-pointer transition-all hover:opacity-80" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-50 text-zinc-950 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20">
                   {h}
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-zinc-500 px-2">
            {trends?.labels?.map((label: string, i: number) => (
               <span key={i}>{label}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
