import { BusinessDNA } from "../../types";
import { AlertCircle, TrendingUp, Lightbulb, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Overview({ dna }: { dna: BusinessDNA }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("root");
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("NEXUS_AI_Business_Report.pdf");
      
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Dashboard Overview</h2>
          <p className="text-zinc-400 text-sm mt-1">NEXUS AI is monitoring your business metrics.</p>
        </div>
        <div className="text-right hidden sm:flex items-center gap-6">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Target Budget</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">{(dna.budget || 0).toLocaleString()} UZS</p>
          </div>
          <Button 
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
          >
            {isExporting ? <span className="animate-pulse flex items-center gap-2"><Download className="w-4 h-4" /> Generating...</span> : <><FileText className="w-4 h-4 mr-2" /> Export PDF</>}
          </Button>
        </div>
      </div>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 transition-colors shadow-lg shadow-black/20">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono text-emerald-500/80 uppercase">Business Score</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-3xl font-bold text-zinc-50 mb-1">84<span className="text-base text-zinc-500">/100</span></p>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% vs last week</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 hover:border-amber-500/50 transition-colors shadow-lg shadow-black/20">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono text-amber-500/80 uppercase">Risk Level</span>
            </div>
            <p className="text-3xl font-bold text-amber-400 mb-1">32<span className="text-base text-amber-400/50">%</span></p>
            <p className="text-xs text-amber-400/80 line-clamp-1">Moderate risk in {dna.district}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 hover:border-blue-500/50 transition-colors shadow-lg shadow-black/20">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono text-blue-500/80 uppercase">Opportunity Score</span>
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-1">9.2<span className="text-base text-blue-400/50">/10</span></p>
            <p className="text-xs text-blue-400/80">3 new insights found</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Alerts and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitor Alerts */}
        <Card className="bg-zinc-950 border-zinc-800 p-6">
          <h3 className="text-sm font-bold text-zinc-50 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Competitor Alerts
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <p className="text-xs text-amber-400 font-bold mb-1">Price Drop Detected</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Top Competitor A reduced prices by 15% in {dna.district}. Consider running a targeted promotion.</p>
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-xs text-blue-400 font-bold mb-1">New Competitor</p>
              <p className="text-xs text-zinc-400 leading-relaxed">A new {dna.industry || 'business'} opened 2km away from your target area.</p>
            </div>
          </div>
        </Card>

        {/* AI Quick Recommendations */}
        <Card className="bg-zinc-950 border-zinc-800 p-6">
          <h3 className="text-sm font-bold text-zinc-50 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-500" /> AI Recommendations
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-800">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-500 font-bold text-[10px]">1</span>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200 mb-0.5">Reallocate Budget</p>
                <p className="text-xs text-zinc-500 leading-relaxed">Shift 5% from rent to digital marketing for better ROI this month.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-800">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-500 font-bold text-[10px]">2</span>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200 mb-0.5">Explore Franchise</p>
                <p className="text-xs text-zinc-500 leading-relaxed">Franchise opportunities match your budget with an 85% success probability.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
