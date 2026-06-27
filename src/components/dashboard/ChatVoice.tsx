import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, User, Volume2, Sparkles, StopCircle } from "lucide-react";
import { BusinessDNA } from "../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatVoiceProps {
  dna: BusinessDNA;
}

export default function ChatVoice({ dna }: ChatVoiceProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Salom! Men NEXUS AI man. Biznesingiz bo'yicha qanday savolingiz bor? Yozishingiz yoki ovozli xabar qoldirishingiz mumkin." }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'uz-UZ'; // default to Uzbek

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
           setInput(prev => prev + " " + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    const currentMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(currentMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/dna/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna,
          messages: currentMessages.map(m => ({ sender: m.role, text: m.content })),
          agent: { name: "NEXUS AI", role: "Business Advisor", description: "You are an expert business advisor." }
        })
      });

      if (!response.ok || !response.body) throw new Error("Network error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
      
      let aiText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                aiText += data.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = aiText;
                  return newMsgs;
                });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMic = () => {
    if (!SpeechRecognition) {
      alert("Kechirasiz, sizning brauzeringiz mikrofonni qo'llab-quvvatlamaydi. Chrome ishlating.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, ''));
      utterance.lang = 'uz-UZ';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto h-[80vh] flex flex-col border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
            <Bot className="w-5 h-5 text-emerald-500" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-zinc-50 text-sm">NEXUS AI Advisor</h2>
            <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm' 
                  : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300 rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && i !== 0 && !isTyping && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/50 flex gap-2">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(msg.content)}
                      className="text-[10px] h-6 px-2 font-mono flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" /> Tinglash
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 relative">
          <Button 
            variant={isRecording ? "destructive" : "secondary"}
            size="icon"
            onClick={handleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isRecording ? 'animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700'
            }`}
          >
            {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1 relative">
            {isRecording && !input ? (
              <div className="h-12 w-full bg-zinc-900 border border-zinc-800 rounded-full px-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-sm font-mono text-zinc-400">Tinglanmoqda... Gapiring</span>
              </div>
            ) : (
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Siz gapirayotgan matn..." : "Biznesingiz haqida so'rang..."}
                className="w-full h-12 bg-zinc-900/50 border-zinc-800 text-zinc-50 text-sm rounded-full px-6 focus-visible:ring-emerald-500 transition-colors"
              />
            )}
          </div>

          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !isTyping ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
