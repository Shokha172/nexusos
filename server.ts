import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";
import TelegramBot from "node-telegram-bot-api";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable JSON parse middleware
app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini Client successfully initialized server-side.");
    } catch (e) {
      console.error("Failed to initialize Gemini Client:", e);
    }
  }
  return aiClient;
}

// Initialize Telegram Bot lazily/safely
let telegramBot: TelegramBot | null = null;
function getTelegramBot(): TelegramBot | null {
  if (!telegramBot && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
      console.log("Telegram Bot successfully initialized.");
      
      // Bot message handler
      telegramBot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        if (msg.text === "/start") {
          telegramBot?.sendMessage(chatId, "Welcome to NEXUS AI Assistant (@plannexusbot). Connect your dashboard to receive PDF reports, weekly missions, and real-time alerts.");
        } else if (msg.text === "/summary") {
          telegramBot?.sendMessage(chatId, "Fetching latest dashboard summary...");
          // Here we would typically fetch the user's latest summary from DB
          telegramBot?.sendMessage(chatId, "Your Business Score is 84. You have 3 pending Weekly Missions. Keep up the good work!");
        } else {
          // Send to Gemini
          const client = getGeminiClient();
          if (client) {
             try {
                const response = await client.models.generateContent({
                   model: "gemini-3.5-flash",
                   contents: msg.text || "Hello",
                   config: { systemInstruction: "You are NEXUS AI, a brilliant Business Assistant. Reply concisely for Telegram." }
                });
                telegramBot?.sendMessage(chatId, response.text || "I processed your request but have no response.");
             } catch (err) {
                telegramBot?.sendMessage(chatId, "Sorry, my AI engine is currently unavailable.");
             }
          } else {
             telegramBot?.sendMessage(chatId, "AI engine is not configured.");
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize Telegram Bot:", e);
    }
  }
  return telegramBot;
}

// Start Telegram Bot
getTelegramBot();

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Analyze DNA and generate Business Passport
app.post("/api/dna/analyze", async (req, res) => {
  const { dna } = req.body;
  if (!dna) {
    return res.status(400).json({ error: "Business DNA is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Serving highly realistic mock Passport data.");
    return res.json({ ...getMockPassport(dna), fallback: true });
  }

  try {
    const prompt = `
      Analyze this Business DNA for a startup. Generate detailed scores out of 100, SWOT analysis, dynamic market overview, marketing strategy, and overall recommendations.
      Business DNA:
      - Industry: ${dna.industry}
      - Location: ${dna.location}
      - Budget: ${dna.budget} ${dna.budgetCurrency}
      - Target Audience: ${dna.targetAudience}
      - Risk Level: ${dna.riskLevel}
      - Growth Goal: ${dna.growthGoal}
      - Marketing Channels: ${dna.marketingChannels?.join(", ")}
      - Business Model: ${dna.businessModel}
      - Competition: ${dna.competition}
      - Brand Style: ${dna.brandStyle}
      - Pricing Strategy: ${dna.pricingStrategy}
      - Vision: ${dna.vision}
      - Mission: ${dna.mission}
      - Personality: ${dna.personality}
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            launch: { type: Type.INTEGER, description: "Score from 30 to 100" },
            marketing: { type: Type.INTEGER, description: "Score from 30 to 100" },
            financial: { type: Type.INTEGER, description: "Score from 30 to 100" },
            risk: { type: Type.INTEGER, description: "Score from 30 to 100" },
            growth: { type: Type.INTEGER, description: "Score from 30 to 100" },
            brand: { type: Type.INTEGER, description: "Score from 30 to 100" },
            overall: { type: Type.INTEGER, description: "Score from 30 to 100" }
          },
          required: ["launch", "marketing", "financial", "risk", "growth", "brand", "overall"]
        },
        recommendation: { type: Type.STRING, description: "An executive level strategic recommendation, highly customized." },
        swot: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["strengths", "weaknesses", "opportunities", "threats"]
        },
        marketOverview: { type: Type.STRING, description: "A comprehensive market analysis and competitor response report." },
        marketingStrategy: { type: Type.STRING, description: "Concrete target audience targeting strategy and acquisition methods." }
      },
      required: ["scores", "recommendation", "swot", "marketOverview", "marketingStrategy"]
    };

    let response;
    try {
      console.log("Attempting high thinking analysis with gemini-3.1-pro-preview...");
      response = await client.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are the Lead Startup Strategist and Solution Architect for Tayanch AI. Provide a deep, extremely realistic, highly personalized analysis. Avoid generic advice. Use your advanced reasoning capabilities to formulate precise solutions.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
    } catch (proErr: any) {
      console.warn("Pro model analysis failed or unavailable. Falling back to gemini-3.5-flash:", proErr.message || proErr);
      response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the Lead Startup Strategist and Solution Architect for Tayanch AI. Provide a deep, extremely realistic, highly personalized analysis. Avoid generic advice.",
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
    }

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini DNA analyze error:", err);
    return res.json({ ...getMockPassport(dna), fallback: true, fallbackReason: err.message || "Quota limit exceeded" });
  }
});

// 2. Chat with specific AI Agent (CEO, CMO, CFO, etc.)
app.post("/api/dna/chat", async (req, res) => {
  const { dna, messages, agent, model, thinking, mapsGrounding, latitude, longitude } = req.body;
  if (!messages || !agent) {
    return res.status(400).json({ error: "Messages and Agent details are required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Generating mock agent chat responses.");
    return res.json({ text: getMockChatResponse(agent, messages, dna) });
  }

  try {
    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const lastMessage = formattedHistory[formattedHistory.length - 1]?.parts[0]?.text || "";
    const historyWithoutLast = formattedHistory.slice(0, -1);

    const chatSystemInstruction = `
      You are "${agent.name}", acting as the "${agent.role}" for the user's business idea.
      Here is your professional persona: ${agent.description}

      You must strictly use the following Business DNA context for all your suggestions:
      - Industry: ${dna?.industry || "N/A"}
      - Location: ${dna?.location || "N/A"}
      - Budget: ${dna?.budget || 0} ${dna?.budgetCurrency || "UZS"}
      - Target Audience: ${dna?.targetAudience || "N/A"}
      - Business Model: ${dna?.businessModel || "N/A"}
      - Competitors: ${dna?.competition || "N/A"}
      - Pricing Strategy: ${dna?.pricingStrategy || "N/A"}
      - Mission: ${dna?.mission || "N/A"}
      - Personality of the company: ${dna?.personality || "N/A"}

      Adopt the tone of an expert C-level advisor. Be practical, direct, and focused on helping the entrepreneur make profitable, risk-reduced decisions. Answer in depth, with bullet points where appropriate. If asked about Uzbekistan market dynamics (e.g., Click, Payme, local competition, Tashkent), include highly tailored regional advice.
    `;

    // Configure model and features based on request
    let selectedModel = model || "gemini-3.5-flash";
    const config: any = {
      systemInstruction: chatSystemInstruction,
    };

    if (mapsGrounding) {
      // Maps Grounding requires gemini-3.5-flash and is disallowed with other schemas/tools
      selectedModel = "gemini-3.5-flash";
      config.tools = [{ googleMaps: {} }];
      
      const lat = latitude || 41.311081; // Default to center of Tashkent, Uzbekistan
      const lng = longitude || 69.240562;
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      };
      console.log(`Enabling Google Maps Grounding with location: lat=${lat}, lng=${lng}`);
    } else if (selectedModel === "gemini-3.1-pro-preview" && thinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      console.log("Enabling High Thinking Mode (gemini-3.1-pro-preview)");
    }

    let response;
    try {
      console.log(`Initializing chat with model=${selectedModel}`);
      const chatInstance = client.chats.create({
        model: selectedModel,
        history: historyWithoutLast,
        config: config
      });

      response = await chatInstance.sendMessage({
        message: lastMessage
      });
    } catch (chatErr: any) {
      console.warn(`Specialized model/grounding chat failed, falling back to gemini-3.5-flash:`, chatErr.message || chatErr);
      const fallbackChat = client.chats.create({
        model: "gemini-3.5-flash",
        history: historyWithoutLast,
        config: {
          systemInstruction: chatSystemInstruction
        }
      });
      response = await fallbackChat.sendMessage({
        message: lastMessage
      });
    }

    return res.json({
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    });
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return res.json({ text: getMockChatResponse(agent, messages, dna) });
  }
});

// 2b. Chat Stream (for typing effect)
app.post("/api/dna/chat-stream", async (req, res) => {
  const { dna, messages, agent } = req.body;
  if (!messages || !agent) {
    return res.status(400).json({ error: "Messages and Agent details are required." });
  }

  const client = getGeminiClient();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!client) {
    // Mock streaming
    const mockResponse = getMockChatResponse(agent, messages, dna);
    const words = mockResponse.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        res.write(`data: ${JSON.stringify({ text: words[i] + " " })}\n\n`);
        i++;
      } else {
        clearInterval(interval);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, 50);
    return;
  }

  try {
    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
    const lastMessage = formattedHistory[formattedHistory.length - 1]?.parts[0]?.text || "";
    const historyWithoutLast = formattedHistory.slice(0, -1);

    const chatInstance = client.chats.create({
      model: "gemini-3.5-flash",
      history: historyWithoutLast,
      config: {
        systemInstruction: `You are "${agent.name}", the "${agent.role}" for the user's business idea. Use Markdown formatting. Use the context: Industry: ${dna?.industry}, Budget: ${dna?.budget}`
      }
    });

    const stream = await chatInstance.sendMessageStream({ message: lastMessage });
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Gemini stream error:", err);
    res.write(`data: ${JSON.stringify({ text: "Error generating response." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// 3. Generate structured Business Plan
app.post("/api/dna/plan", async (req, res) => {
  const { dna } = req.body;
  if (!dna) {
    return res.status(400).json({ error: "Business DNA is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Serving mock Business Plan.");
    return res.json({ ...getMockBusinessPlan(dna), fallback: true });
  }

  try {
    const prompt = `
      Create a fully-detailed, multi-chapter Business Plan for the following Business DNA:
      ${JSON.stringify(dna, null, 2)}
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Startup Incubator director and Business Planner. Write an extensive, professional business plan suitable for seed-stage investors.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "Detailed summary of the business concept, market need, and financial potential." },
            problemSolution: { type: Type.STRING, description: "The core problem in the market and how the business elegantly solves it." },
            marketAnalysis: { type: Type.STRING, description: "Market size, competition landscape, and market segment analysis." },
            marketingSales: { type: Type.STRING, description: "Pricing, promotion channels, customer acquisition strategy, and sales models." },
            financialForecast: { type: Type.STRING, description: "Revenue stream mechanics, break-even targets, and long term projection summary." },
            riskMitigation: { type: Type.STRING, description: "Primary operational, financial, and legal risks and strategic defenses." },
            timeline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A chronological array of milestones (e.g., Month 1: ..., Month 2: ...)"
            }
          },
          required: ["executiveSummary", "problemSolution", "marketAnalysis", "marketingSales", "financialForecast", "riskMitigation", "timeline"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini plan error:", err);
    return res.json({ ...getMockBusinessPlan(dna), fallback: true });
  }
});

// 3b. Generate Weekly Action Plan
app.post("/api/dna/weekly-plan", async (req, res) => {
  const { dna } = req.body;
  if (!dna) return res.status(400).json({ error: "Business DNA is required." });

  const client = getGeminiClient();
  if (!client) {
    return res.json([
      { text: "Bozor tahlili bo'yicha ma'lumotlarni yig'ish", status: "done", time: "Dushanba" },
      { text: "Potensial yetkazib beruvchilar bilan bog'lanish", status: "doing", time: "Bugun" },
      { text: "Marketing byudjetini tasdiqlash", status: "todo", time: "Payshanba" },
      { text: "Joy ijarasi bo'yicha muzokaralar", status: "todo", time: "Juma" }
    ]);
  }

  try {
    const prompt = `
      Based on this business: Industry: ${dna.industry}, Location: ${dna.location}, Budget: ${dna.budget}.
      Create a practical weekly action plan consisting of 5 specific tasks to do this week.
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Business Consultant. Generate exactly 5 tasks for this week.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              status: { type: Type.STRING, description: "'todo', 'doing', or 'done'" },
              time: { type: Type.STRING, description: "e.g., 'Dushanba', 'Bugun', 'Juma'" }
            },
            required: ["text", "status", "time"]
          }
        }
      }
    });

    const tasks = JSON.parse(response.text || "[]");
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate weekly plan" });
  }
});

// 3c. Generate Location Analysis
app.post("/api/dna/location-analysis", async (req, res) => {
  const { dna, lat, lng } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    return res.json({
      footTraffic: "High (~4500 kishi/kun)",
      transport: "8/10 (Metroga yaqin)",
      competitionDensity: "O'rtacha (3 ta o'xshash)",
      businessScore: 85,
      nearbyCompetitors: ["Coffee House", "Local Cafe"],
      opportunities: ["Talabalar oqimi ko'p", "Kechki payt aktiv hudud"]
    });
  }

  try {
    const prompt = `
      Analyze this location for a business:
      Industry: ${dna?.industry}
      Coordinates: Latitude ${lat}, Longitude ${lng}
      
      Provide a highly realistic location intelligence report based on these coordinates (assume they are in Uzbekistan if not specified).
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Location Intelligence Analyst. Provide realistic estimates based on geography and industry.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            footTraffic: { type: Type.STRING },
            transport: { type: Type.STRING },
            competitionDensity: { type: Type.STRING },
            businessScore: { type: Type.INTEGER },
            nearbyCompetitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["footTraffic", "transport", "competitionDensity", "businessScore", "nearbyCompetitors", "opportunities"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate location analysis" });
  }
});

// 3d. Generate Competitor Intelligence
app.post("/api/dna/competitors", async (req, res) => {
  const { dna, query } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json([
      { name: "Premium Service LLC", rating: 4.8, reviews: 124, distance: "0.5 km", hours: "09:00 - 20:00", pros: ["Yuqori sifat", "Yaxshi joylashuv"], cons: ["Qimmat narxlar"] },
      { name: "Local Choice Market", rating: 4.2, reviews: 56, distance: "1.2 km", hours: "08:00 - 22:00", pros: ["Arzon", "Doimiy mijozlar"], cons: ["Eski dizayn", "Xizmat sifati past"] },
      { name: "NextGen Solutions", rating: 4.5, reviews: 89, distance: "2.0 km", hours: "10:00 - 19:00", pros: ["Innovatsion", "Kuchli marketing"], cons: ["Tajriba kam", "Kechikishlar"] }
    ]);
  }

  try {
    const prompt = `
      Perform competitor analysis for a business.
      Industry: ${dna?.industry}
      Location: ${dna?.location}
      Search Query (if any): ${query || 'General competitors'}
      
      Generate 3 highly realistic competitor profiles in the area. Provide pros, cons, realistic ratings, and distance.
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Competitor Intelligence tool. Provide data in JSON array of 3 competitors.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviews: { type: Type.INTEGER },
              distance: { type: Type.STRING },
              hours: { type: Type.STRING },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "rating", "reviews", "distance", "hours", "pros", "cons"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate competitor analysis" });
  }
});

// 3e. Generate Trend Analysis
app.post("/api/dna/trends", async (req, res) => {
  const { dna } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      status: "O'smoqda",
      growthPercent: 18,
      data: [30, 45, 35, 50, 40, 60, 55, 75, 65, 85, 80, 100],
      labels: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"]
    });
  }

  try {
    const prompt = `
      Simulate Google Trends data for a 12-month period for the industry: ${dna?.industry} in ${dna?.location || 'Uzbekistan'}.
      Provide a highly realistic demo dataset.
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI data simulator.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "e.g., 'O'smoqda', 'Pasaymoqda', 'Barqaror'" },
            growthPercent: { type: Type.INTEGER },
            data: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Exactly 12 integers from 0 to 100 representing search volume." },
            labels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "12 short month names like 'Yan', 'Fev' etc." }
          },
          required: ["status", "growthPercent", "data", "labels"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate trend analysis" });
  }
});

// 3f. Generate Overview Data
app.post("/api/dna/overview", async (req, res) => {
  const { dna } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      businessScore: 84,
      riskLevel: 32,
      opportunityScore: 9.2,
      alerts: [
        { title: "Price Drop Detected", description: `Top Competitor A reduced prices by 15% in ${dna?.district || 'your area'}. Consider running a targeted promotion.`, type: "warning" },
        { title: "New Competitor", description: `A new ${dna?.industry || 'business'} opened 2km away from your target area.`, type: "info" }
      ],
      recommendations: [
        { id: 1, title: "Reallocate Budget", description: "Shift 5% from rent to digital marketing for better ROI this month." },
        { id: 2, title: "Explore Franchise", description: "Franchise opportunities match your budget with an 85% success probability." }
      ]
    });
  }

  try {
    const prompt = `
      Based on the business DNA: Industry: ${dna?.industry}, Location: ${dna?.location}, Budget: ${dna?.budget}.
      Generate a realistic dashboard overview including business score (0-100), risk level (0-100%), opportunity score (0-10), 2 competitor alerts, and 2 AI recommendations.
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Business Dashboard generator.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessScore: { type: Type.INTEGER },
            riskLevel: { type: Type.INTEGER },
            opportunityScore: { type: Type.NUMBER },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, description: "'warning' or 'info'" }
                },
                required: ["title", "description", "type"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["businessScore", "riskLevel", "opportunityScore", "alerts", "recommendations"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate overview data" });
  }
});

// 3g. Scenario Simulator
app.post("/api/dna/scenario", async (req, res) => {
  const { dna, scenario } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      result: "AI Hisob-kitoblariga ko'ra:\n\n1. Mijozlar oqimi o'rtacha 18% ga oshishi kutiladi.\n2. LTV (Mijozning umrboqiy qiymati) hisobga olinsa, bu xarajat 2.5 oyda qoplanadi.\n3. Risk: Mahalliy bozorda (Tumanda) bu miqdordagi reklamaga javob beradigan auditoriya sig'imi yetarli bo'lmasligi mumkin. Ijtimoiy tarmoqlardagi target qamrovini kengroq olish tavsiya etiladi."
    });
  }

  try {
    const prompt = `
      Business: Industry: ${dna?.industry}, Location: ${dna?.location}, Budget: ${dna?.budget}.
      User asks scenario: "${scenario}".
      Provide a highly realistic projection in Uzbek language, using markdown bullet points. Mention metrics like customer flow, ROI time, and risks.
    `;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Scenario Simulator. Provide realistic business impact projections.",
      }
    });

    return res.json({ result: response.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to simulate scenario" });
  }
});

// 4. Generate branding style guidelines
app.post("/api/dna/brand", async (req, res) => {
  const { dna } = req.body;
  if (!dna) {
    return res.status(400).json({ error: "Business DNA is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Serving mock branding.");
    return res.json({ ...getMockBranding(dna), fallback: true });
  }

  try {
    const prompt = `
      Create a premium Brand Style Guide and Slogans for the following company DNA:
      - Industry: ${dna.industry}
      - Personality: ${dna.personality}
      - Vision: ${dna.vision}
      - Target Audience: ${dna.targetAudience}
      - Brand Style preference: ${dna.brandStyle}
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Creative Director at a world-class premium design agency like Pentagram or Apple. Create elegant slogans, exact visual styles, color palettes, and brand voice guidelines.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slogans: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 premium slogans/taglines." },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING }
                },
                required: ["name", "hex"]
              },
              description: "4-5 color palette items with name and Hex value"
            },
            brandVoice: { type: Type.STRING, description: "Brand voice, communication guidelines, and copywriting guidelines." },
            visualDirection: { type: Type.STRING, description: "Design principles, typography guide, logo style suggestions." }
          },
          required: ["slogans", "colors", "brandVoice", "visualDirection"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini brand error:", err);
    return res.json({ ...getMockBranding(dna), fallback: true });
  }
});

// 5. Generate Financial Model Forecast
app.post("/api/dna/finance", async (req, res) => {
  const { dna } = req.body;
  if (!dna) {
    return res.status(400).json({ error: "Business DNA is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Serving mock financials.");
    return res.json({ ...getMockFinancials(dna), fallback: true });
  }

  try {
    const prompt = `
      Analyze this monthly financial data for a business:
      Industry: ${dna.industry}
      Location: ${dna.location}
      Inputs: ${JSON.stringify(req.body.financialInputs)}

      Generate a financial analysis including:
      - cashFlow: "Positive", "Negative", or "Neutral"
      - profitEstimate: Number (Revenue - all expenses)
      - budgetAllocation: Array of categories (Rent, Salary, etc.) with their percentage of total expenses, and status ("High", "Normal", "Low")
      - riskLevel: "High", "Medium", "Low"
      - riskReason: Short explanation of the main financial risk
      - growthSuggestion: Actionable advice to improve margins
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI CFO. Analyze the provided monthly numbers and give a precise JSON response.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cashFlow: { type: Type.STRING },
            profitEstimate: { type: Type.INTEGER },
            budgetAllocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  percentage: { type: Type.INTEGER },
                  status: { type: Type.STRING }
                },
                required: ["category", "percentage", "status"]
              }
            },
            riskLevel: { type: Type.STRING },
            riskReason: { type: Type.STRING },
            growthSuggestion: { type: Type.STRING }
          },
          required: ["cashFlow", "profitEstimate", "budgetAllocation", "riskLevel", "riskReason", "growthSuggestion"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini finance error:", err);
    return res.json({ ...getMockFinancials(dna), fallback: true });
  }
});

// 6. Market Trends Analysis
app.post("/api/dna/market-trends", async (req, res) => {
  const { dna } = req.body;
  if (!dna) {
    return res.status(400).json({ error: "Business DNA is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Serving highly detailed mock market trends.");
    return res.json({ ...getMockMarketTrends(dna), fallback: true });
  }

  try {
    const prompt = `
      Analyze current market trends for this startup:
      Industry: ${dna.industry}
      Location: ${dna.location}
      Target Audience: ${dna.targetAudience}
      Business Model: ${dna.businessModel}

      Generate 4 emerging trend items relevant to this industry in Uzbekistan (referencing Spot.uz, Gazeta.uz, Kun.uz, Telegram, local communities).
      Also generate 6-month historical search trend index comparison chart data (Jan to Jun) matching this industry's seasonality.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Uzbekistan-specific Venture Capital & Consumer Market Trends Analyst. Provide highly specific regional recommendations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Must be exactly news, social, or industry" },
                  index: { type: Type.INTEGER, description: "Trend growth percentage index from 10 to 500" },
                  impact: { type: Type.STRING, description: "Must be exactly High, Medium, or Low" },
                  recommendation: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["name", "category", "index", "impact", "recommendation", "source"]
              }
            },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  current: { type: Type.INTEGER },
                  baseline: { type: Type.INTEGER }
                },
                required: ["month", "current", "baseline"]
              }
            }
          },
          required: ["trends", "chartData"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini trends error:", err);
    return res.json({ ...getMockMarketTrends(dna), fallback: true });
  }
});

// 7. Google Trends Search Keyword Simulator
app.post("/api/dna/google-trends", async (req, res) => {
  const { dna, keyword } = req.body;
  if (!dna || !keyword) {
    return res.status(400).json({ error: "DNA and keyword are required." });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({ ...getMockGoogleTrendsKeyword(dna, keyword), fallback: true });
  }

  try {
    const prompt = `
      Analyze search volume, interest and potential competition in Uzbekistan for this specific search query: "${keyword}"
      Context: Startup industry is ${dna.industry} in ${dna.location}.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a regional SEO and Google Search Console auditor in Tashkent. Provide short, practical projections about search interest.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            sentiment: { type: Type.STRING, description: "High, Increasing, or Declining" },
            analysis: { type: Type.STRING },
            volume: { type: Type.INTEGER },
            competition: { type: Type.STRING, description: "Low, Medium, or High" }
          },
          required: ["keyword", "sentiment", "analysis", "volume", "competition"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ ...data, fallback: false });
  } catch (err: any) {
    console.error("Gemini google trends error:", err);
    return res.json({ ...getMockGoogleTrendsKeyword(dna, keyword), fallback: true });
  }
});


// ==========================================
// MOCK DATA GENERATOR FUNCTIONS
// ==========================================

function getMockPassport(dna: any) {
  const launchScore = Math.floor(65 + Math.random() * 25);
  const marketingScore = Math.floor(55 + Math.random() * 35);
  const financialScore = Math.floor(60 + Math.random() * 30);
  const riskScore = dna.riskLevel === 'Low' ? 85 : dna.riskLevel === 'Medium' ? 65 : 45;
  const growthScore = Math.floor(70 + Math.random() * 25);
  const brandScore = Math.floor(60 + Math.random() * 35);
  const overall = Math.round((launchScore + marketingScore + financialScore + riskScore + growthScore + brandScore) / 6);

  return {
    scores: {
      launch: launchScore,
      marketing: marketingScore,
      financial: financialScore,
      risk: riskScore,
      growth: growthScore,
      brand: brandScore,
      overall: overall
    },
    recommendation: `Tayanch AI launch evaluation for your proposed **${dna.industry}** in **${dna.location}** indicates highly promising potential. Your estimated budget of **${dna.budget.toLocaleString()} ${dna.budgetCurrency}** is sufficient to launch a polished MVP, provided you minimize early capital expenditures. Your high-level objective should focus heavily on customer validation and leveraging local digital channels like Telegram, Instagram, and local community loops. Establish immediate pricing that secures positive cash flow within 45 days.`,
    swot: {
      strengths: [
        `Tailored solution specifically solving immediate customer friction in the ${dna.industry} sector.`,
        `Low operating overhead aligned with a lean ${dna.businessModel} model.`,
        `Strong local target audience focus: ${dna.targetAudience}.`,
        `Distinct company personality (${dna.personality}) resonates with modern consumers.`
      ],
      weaknesses: [
        `Relatively limited initial capital budget (${dna.budget.toLocaleString()} ${dna.budgetCurrency}) for aggressive market penetration.`,
        `High reliance on dynamic pricing and direct digital sales channels which require steep customer trust.`,
        `Direct and indirect local competition: ${dna.competition}.`
      ],
      opportunities: [
        `Rapid regional expansion in Tashkent and other fast-growing Central Asian business hubs.`,
        `Integrating seamless mobile-payments (Click, Payme, Uzcard, Humo) for zero-friction buying.`,
        `Building a automated Telegram Bot channel to capture high-density Uzbek and regional chat audiences.`
      ],
      threats: [
        `Sudden shifts in consumer preferences or regulatory compliance issues.`,
        `Rapid replica releases by larger capital-backed regional competitors.`,
        `High cost-of-acquisition spikes on traditional paid social media networks.`
      ]
    },
    marketOverview: `The **${dna.industry}** sector in **${dna.location}** is currently experiencing double-digit annual growth, fueled by digitalization and a rising demographic of energetic entrepreneurs and digital-native customers. Local competitor analysis of "**${dna.competition}**" reveals that traditional players suffer from slow customer onboarding and high service prices. By positioning your company with a **${dna.personality}** personality, and focusing on a highly agile **${dna.businessModel}** model, you can rapidly siphon off early-stage demand.`,
    marketingStrategy: `To capture **${dna.targetAudience}**, implement a highly targeted regional launch. Leverage ${dna.marketingChannels?.join(", ") || "social media"} with custom visual campaigns. Standardized pricing via a "${dna.pricingStrategy}" model will establish rapid trust. Capitalize heavily on peer-to-peer viral mechanics by introducing custom referral discounts and regional Telegram community partnerships.`
  };
}

function getMockChatResponse(agent: any, messages: any[], dna: any): string {
  const userMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
  
  const companyInfo = `our **${dna?.industry || "venture"}** based in **${dna?.location || "Tashkent"}**`;

  if (agent.id === "ceo") {
    if (userMsg.includes("uzbekistan") || userMsg.includes("tashkent") || userMsg.includes("market")) {
      return `As your AI CEO, I must highlight that the Uzbek market is experiencing an unprecedented digital boom. To win in ${dna?.location || "Tashkent"}, we need to prioritize three things:\n\n1. **Telegram Ecosystem First**: In Uzbekistan, Telegram is not just a chat app; it is the entire internet. We must launch a high-converting Telegram webapp/bot.\n2. **Mobile Integration**: Integrate Click and Payme APIs on day one. Our customers expect instant payments without leaving their smartphones.\n3. **Localization**: Ensure all copywriting has perfect Uzbek and Russian variants. This doubles our reach instantly.\n\nWhat is your perspective on starting with a soft-launch in the capital city?`;
    }
    return `That is a tactical milestone we need to secure. To establish ${companyInfo} as a dominant force, my immediate recommendation is to validate our value proposition with a closed beta group of 50 active users from our target segment (**${dna?.targetAudience || "our audience"}**).\n\nThis keeps our burn rate incredibly low while we refine the product-market fit. Let's outline the core operational checklist. What specific department are you most concerned about right now?`;
  }

  if (agent.id === "cfo") {
    if (userMsg.includes("budget") || userMsg.includes("cost") || userMsg.includes("price") || userMsg.includes("money")) {
      return `Let's talk unit economics. With our budget of **${dna?.budget?.toLocaleString() || "50,000,000"} ${dna?.budgetCurrency || "UZS"}**, we must be extremely surgical:\n\n- **60% CAPEX**: Product Development & Licensing. Keep this lean. Use no-code or robust templates first.\n- **30% Working Capital**: Customer Acquisition and onboarding tests.\n- **10% Buffer**: Reserve this for compliance, local taxes, or payment gateway setup fees.\n\nBased on our **${dna?.pricingStrategy || "value-based"}** pricing strategy, we can target a break-even point in month 4 if we secure at least 150 high-paying monthly active clients. Let's look at adjusting the operational expenses to see where we can trim fat.`;
    }
    return `From a financial perspective, cash flow is our lifeblood. We must avoid locking up capital in long-term office leases or complex inventory models early on. Let's focus on building a lean subscription or digital transactional flow. Shall we calculate our detailed burn-rate or review the monthly cash-flow forecast?`;
  }

  if (agent.id === "cmo") {
    return `Our branding voice as a **${dna?.personality || "Professional"}** brand must be clear and direct. For ${companyInfo}, we should activate the following marketing channels: **${dna?.marketingChannels?.join(" and ") || "Social Media"}**.\n\nHere is our 3-step acquisition flywheel:\n1. **High-Value Education**: Share insider tips on how our product solves their specific pain points.\n2. **Micro-Influencer Amplification**: Partner with niche local creators who already have the trust of **${dna?.targetAudience || "our audience"}**.\n3. **Launch Day Incentives**: Offer exclusive, limited-edition lifetime pricing to the first 100 subscribers to create high FOMO.\n\nShould we draft our launch campaign or brainstorm key slogans?`;
  }

  if (agent.id === "growth") {
    return `To execute our growth goal of "**${dna?.growthGoal || "Rapid market entry"}**", we need to think like growth hackers. Let's implement a referral program where existing clients get immediate platform credits or cash back via Click/Payme when they refer a new paying customer. This creates an organic viral coefficient. Let's look at the analytics funnel: we want a conversion rate of at least 3.5% from landing page visitor to active lead. What are your thoughts on implementing this referral loop?`;
  }

  return `That makes perfect sense. Under our Business DNA, we are building a highly innovative business. Let's map out exactly how we can execute this step to maximize our launching score. What other questions can I answer for you?`;
}

function getMockBusinessPlan(dna: any) {
  return {
    executiveSummary: `Tayanch AI has architected this Business Plan to outline the strategic deployment of a premier **${dna.industry}** startup in **${dna.location}**. Operating under a high-efficiency **${dna.businessModel}** model, our company targets the critical pain points faced by **${dna.targetAudience}**. Backed by an optimized initial budget of **${dna.budget.toLocaleString()} ${dna.budgetCurrency}**, this business is designed for exponential cash flow generation, targeting regional market dominance.`,
    problemSolution: `Traditional solutions in the ${dna.industry} segment are plagued by slow delivery speeds, outdated client interfaces, and high pricing structures. Our startup directly solves this by delivering an ultra-personalized, digital-first experience that fits seamlessly into the user's daily workflow. Our customized value proposition is powered by an agile operations stack, providing premium results at an affordable entry cost.`,
    marketAnalysis: `The target market for our services in **${dna.location}** represents a massive underserved segment. Main competitors like "**${dna.competition}**" are sluggish and fail to capture digital-savvy cohorts. By leveraging a cohesive **${dna.personality}** brand style, we project capturing a 3.5% market share within the first 12 months, fueled by rapid regional urbanization and high smartphone penetration.`,
    marketingSales: `Our marketing blueprint relies on high-impact channels including **${dna.marketingChannels?.join(", ") || "organic and digital campaigns"}**. We will implement a "${dna.pricingStrategy}" pricing strategy to maximize customer acquisition speed. Customer onboarding will be facilitated by self-serve digital onboarding and localized community partnerships.`,
    financialForecast: `With an initial capital of **${dna.budget.toLocaleString()} ${dna.budgetCurrency}**, our forecast expects to achieve positive monthly cash flow by Month 3. High margin services combined with automated transactional loops ensure a 68% gross margin. We project hitting our critical break-even threshold within 120 days.`,
    riskMitigation: `Key identified risks include dynamic competitor pricing moves and customer retention fluctuations. We mitigate these risks by locking in long-term subscriber commitments via customized branding perks, executing continuous product feedback loops, and keeping our operational burn-rate extremely lean.`,
    timeline: [
      "Month 1: Brand identity design, corporate registration, and merchant account setup (Click, Payme).",
      "Month 2: Soft launch of the minimum viable product (MVP) to a closed pool of 100 beta participants.",
      "Month 3: Full public launch across the main target regions in Tashkent accompanied by aggressive viral referral programs.",
      "Month 4: Introduce advanced automation, expand marketing channels, and evaluate early unit profitability.",
      "Month 5: Initiate partnership negotiations with major commercial networks and key localized influencers.",
      "Month 6: Scale operations, expand the remote customer success team, and prepare a Series-A pitch."
    ]
  };
}

function getMockBranding(dna: any) {
  return {
    slogans: [
      `Elevating the Future of ${dna.industry || "Business"}.`,
      `The Intelligent Choice for ${dna.targetAudience || "Modern Creators"}.`,
      `Smarter Decisions. Faster Growth. Perfect Execution.`,
      `Redefining ${dna.industry || "Your Sector"} with Pure Elegance.`,
      `Unleash Your Business DNA.`
    ],
    colors: [
      { name: "Cosmic Charcoal", hex: "#0D0E12" },
      { name: "Sleek Platinum", hex: "#E2E8F0" },
      { name: "Neon Emerald", hex: "#10B981" },
      { name: "Deep Cobalt", hex: "#1E3A8A" },
      { name: "Warm Amber", hex: "#F59E0B" }
    ],
    brandVoice: `The brand voice for our company is **${dna.personality || "Sophisticated and Modern"}**. Communication should be highly professional, authoritative, yet encouraging and accessible. Avoid unnecessary corporate jargon; favor clean, data-driven typography, and speak directly to the entrepreneur or customer's aspirations. In regional Uzbek copywriting, use a refined and highly polite tone that inspires ultimate consumer trust.`,
    visualDirection: `The visual aesthetic embraces premium Apple-style luxury minimalism. Focus on high-contrast layouts utilizing deep black backgrounds paired with crisp silver typography. Accent elements should be highlights in Neon Emerald to indicate growth and dynamic action. Use generous negative space and avoid messy border styles. Typography should pair modern Sans-serif titles (e.g., Space Grotesk) with Mono font accents for technical accuracy.`
  };
}

function getMockFinancials(dna: any) {
  return {
    profitEstimate: 12000000,
    cashFlow: "Positive",
    budgetAllocation: [
       { category: "Rent", percentage: 25, status: "Normal" },
       { category: "Salary", percentage: 40, status: "High" },
       { category: "Advertising", percentage: 15, status: "Normal" }
    ],
    riskLevel: "Medium",
    riskReason: "High initial salary costs before revenue stabilizes.",
    growthSuggestion: "Focus on automated acquisition to reduce labor costs."
  };
}

function getMockMarketTrends(dna: any) {
  const ind = dna.industry || "Business";
  const loc = dna.location || "Tashkent";

  return {
    trends: [
      {
        name: `Raqamlashtirish & Shoshilinch Buyurtmalar ko'payishi`,
        category: "news",
        index: 185,
        impact: "High",
        recommendation: `Mijozlar buyurtmalarni Telegram WebApp va qisqa vaqtda yetkazishni talab qilmoqda. Telegram-Bot va mobil xizmatlarni yo'lga qo'ying.`,
        source: "Spot.uz"
      },
      {
        name: `Click va Payme orqali bir martalik va to'g'ridan-to'g'ri to'lovlar`,
        category: "social",
        index: 240,
        impact: "High",
        recommendation: `Uzbekistondagi premium mijozlar uchun barcha to'lovlar Click/Payme API orqali amalga oshishini taminlash.`,
        source: "Telegram Community"
      },
      {
        name: `Ekologik toza va milliy brending trendi`,
        category: "industry",
        index: 120,
        impact: "Medium",
        recommendation: `Qadoqlash va mahsulotda o'zbek an'analari va ekologik tozalikni aks ettiring.`,
        source: "Gazeta.uz"
      },
      {
        name: `Soliq hisobotlarini avtomatlashtirish (Didox integratsiyasi)`,
        category: "news",
        index: 95,
        impact: "Medium",
        recommendation: `Tadbirkorlarning soliq yukini kamaytirish va hisobotlarni to'g'ridan-to'g'ri MySoliq tizimiga integratsiya qilish kerak.`,
        source: "Soliq Qo'mitasi"
      }
    ],
    chartData: [
      { month: "Yan", current: 35, baseline: 25 },
      { month: "Fev", current: 48, baseline: 30 },
      { month: "Mar", current: 65, baseline: 32 },
      { month: "Apr", current: 85, baseline: 40 },
      { month: "May", current: 98, baseline: 42 },
      { month: "Iyun", current: 120, baseline: 45 }
    ]
  };
}

function getMockGoogleTrendsKeyword(dna: any, keyword: string) {
  const indexVal = Math.floor(40 + Math.random() * 55);
  return {
    keyword,
    sentiment: indexVal > 70 ? "High" : "Increasing",
    analysis: `O'zbekiston miqyosida "${keyword}" qidiruvi so'nggi 3 oy ichida sezilarli darajada oshgan. Mirobod va Yakkasaroy hududlarida eng yuqori qiziqish kuzatiladi.`,
    volume: Math.floor(12000 + Math.random() * 38000),
    competition: indexVal > 60 ? "High" : "Medium"
  };
}

// ==========================================
// VITE DEV SERVER & PRODUCTION ROUTING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server route configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
