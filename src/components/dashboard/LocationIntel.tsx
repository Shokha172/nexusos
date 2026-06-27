import { useState, useEffect } from "react";
import { MapPin, Lock, Sparkles, AlertTriangle } from "lucide-react";
import { BusinessDNA } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationIntel({ dna }: { dna: BusinessDNA }) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLocationData = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dna/location-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, lat, lng })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      setError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          fetchLocationData(lat, lng);
        },
        (err) => {
          console.warn(err);
          setError("Joylashuvni aniqlashga ruxsat berilmadi. Standart hudud (Toshkent markazi) olinmoqda.");
          // Default to Tashkent center
          const lat = 41.311081;
          const lng = 69.240562;
          setLocation({ lat, lng });
          fetchLocationData(lat, lng);
        }
      );
    } else {
      setError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi.");
    }
  };

  useEffect(() => {
    // Attempt to get location automatically
    handleGetLocation();
  }, [dna]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50 mb-2">Location Intelligence</h2>
          <p className="text-zinc-400 text-sm">Optimal joylashuv tahlili: {dna.district || "Sizning hududingiz"}</p>
        </div>
        <Button 
          onClick={handleGetLocation}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
        >
          <MapPin className="w-4 h-4 mr-2" /> Joylashuvni yangilash
        </Button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-mono text-blue-400 uppercase block font-bold mb-1">Privacy Consent</span>
          <p className="text-xs text-blue-200/80 leading-relaxed">
            Dastur geolokatsiya ma'lumotlaridan faqat tahlil vaqtida foydalanadi va ularni hech qayerda saqlamaydi.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-500 text-sm">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden shadow-xl p-0">
        {/* Real Map Area using OpenStreetMap Iframe (No API key required) */}
        <div className="h-[400px] bg-zinc-900 relative flex items-center justify-center border-b border-zinc-800">
          {location ? (
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.02}%2C${location.lat-0.02}%2C${location.lng+0.02}%2C${location.lat+0.02}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
              className="grayscale-[0.8] invert-[0.9] contrast-[1.2]"
            ></iframe>
          ) : (
             <div className="flex flex-col items-center justify-center text-zinc-500 animate-pulse">
               <MapPin className="w-10 h-10 mb-2" />
               <p>Xarita yuklanmoqda...</p>
             </div>
          )}
        </div>

        <CardContent className="p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-emerald-500">
              <Sparkles className="w-8 h-8 mb-2 animate-spin" />
              <p className="text-sm font-bold">AI Joylashuvni tahlil qilmoqda...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Business Score</p>
              <p className="text-3xl font-black text-emerald-500">{analysis?.businessScore || "--"}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Piyodalar oqimi</p>
              <p className="text-xl font-bold text-zinc-50">{analysis?.footTraffic?.split(" ")[0] || "--"}</p>
              <p className="text-xs text-emerald-400 mt-1">{analysis?.footTraffic}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Transport qulayligi</p>
              <p className="text-xl font-bold text-zinc-50">{analysis?.transport?.split(" ")[0] || "--"}</p>
              <p className="text-xs text-zinc-400 mt-1">{analysis?.transport}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Raqobat zichligi</p>
              <p className="text-xl font-bold text-amber-400">{analysis?.competitionDensity?.split(" ")[0] || "--"}</p>
              <p className="text-xs text-zinc-400 mt-1">{analysis?.competitionDensity}</p>
            </div>
          </div>

          {analysis && (
            <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <h4 className="text-sm font-bold text-zinc-50 mb-3 text-rose-400">Yaqin atrofdagi raqobatchilar</h4>
                  <ul className="list-disc pl-5 space-y-1">
                     {analysis.nearbyCompetitors?.map((c: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-300">{c}</li>
                     ))}
                  </ul>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-zinc-50 mb-3 text-emerald-400">Yashirin imkoniyatlar (Opportunities)</h4>
                  <ul className="list-disc pl-5 space-y-1">
                     {analysis.opportunities?.map((o: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-300">{o}</li>
                     ))}
                  </ul>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
