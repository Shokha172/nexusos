import { motion } from "motion/react";
import { ArrowRight, Bot, Shield, LineChart, Globe } from "lucide-react";
import { Language, translations } from "../translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  lang: Language;
  onSetLang: (l: Language) => void;
}

export default function LandingPage({ onStart, onLogin, lang, onSetLang }: LandingPageProps) {
  const t = translations[lang];

  const features = [
    {
      icon: <LineChart className="w-6 h-6 text-emerald-400" />,
      title: lang === "uz" ? "Moliyaviy Tahlil" : lang === "ru" ? "Финансовый Анализ" : "Financial Analysis",
      description: lang === "uz" 
        ? "Kirim-chiqim, foyda, zaif nuqtalar va byudjetni taqsimlash bo'yicha aqlli tavsiyalar."
        : lang === "ru"
        ? "Умные рекомендации по доходам, расходам, слабым местам и распределению бюджета."
        : "Smart recommendations for cash flow, profit, weak points, and budget allocation."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: lang === "uz" ? "Raqobatchilar Tahlili" : lang === "ru" ? "Анализ Конкурентов" : "Competitor Intelligence",
      description: lang === "uz"
        ? "Raqobatchilarning reytingi, narxlari va kuchli tomonlarini AI orqali taqqoslash."
        : lang === "ru"
        ? "Сравнение рейтингов, цен и сильных сторон конкурентов с помощью ИИ."
        : "Compare competitor ratings, pricing, and strengths using AI."
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      title: lang === "uz" ? "Joylashuv Tahlili" : lang === "ru" ? "Анализ Локации" : "Location Intelligence",
      description: lang === "uz"
        ? "Raqobat zichligi va aholi talabi asosida biznesingiz uchun eng yaxshi joyni tanlang."
        : lang === "ru"
        ? "Выберите лучшее место для вашего бизнеса на основе плотности конкуренции и спроса."
        : "Choose the best location for your business based on competition density and demand."
    },
    {
      icon: <Bot className="w-6 h-6 text-emerald-400" />,
      title: lang === "uz" ? "Haftalik AI Mentor" : lang === "ru" ? "Еженедельный ИИ-ментор" : "Weekly AI Mentor",
      description: lang === "uz"
        ? "Har hafta biznes holatingiz bo'yicha aniq vazifalar, ogohlantirishlar va o'sish bo'yicha tavsiyalar."
        : lang === "ru"
        ? "Еженедельные задачи, предупреждения и рекомендации по росту для вашего бизнеса."
        : "Weekly actionable tasks, warnings, and growth recommendations for your business."
    }
  ];

  const pricingPlans = [
    {
      name: t.freePlan,
      price: "0 UZS",
      period: t.forever,
      features: lang === "uz" ? [
        "Bitta Biznes DNK",
        "Asosiy moliyaviy tahlil",
        "3 ta raqobatchini qidirish",
        "Asosiy AI tavsiyalari"
      ] : lang === "ru" ? [
        "Одна ДНК бизнеса",
        "Базовый финансовый анализ",
        "Поиск 3 конкурентов",
        "Базовые рекомендации ИИ"
      ] : [
        "One Business DNA",
        "Basic Financial Analysis",
        "Search 3 Competitors",
        "Basic AI Recommendations"
      ],
      cta: t.launchFree,
      popular: false
    },
    {
      name: t.proPlan,
      price: "199,000 UZS",
      period: t.perMonth,
      features: lang === "uz" ? [
        "Cheksiz Biznes DNK",
        "Chuqur moliyaviy prognoz",
        "Cheksiz raqobatchilar tahlili",
        "Joylashuv xaritasi va tahlili",
        "Haftalik AI Mentor hisobotlari",
        "Integratsiyalar (my.gov, Soliq)"
      ] : lang === "ru" ? [
        "Безлимитная ДНК бизнеса",
        "Глубокий финансовый прогноз",
        "Анализ конкурентов без ограничений",
        "Карта локаций и анализ",
        "Еженедельные отчеты ИИ-ментора",
        "Интеграции (my.gov, Soliq)"
      ] : [
        "Unlimited Business DNA",
        "Deep Financial Projections",
        "Unlimited Competitor Analysis",
        "Location Map & Intelligence",
        "Weekly AI Mentor Reports",
        "Integrations (my.gov, Soliq)"
      ],
      cta: t.goPro,
      popular: true
    },
    {
      name: t.businessPlan,
      price: "499,000 UZS",
      period: t.perMonth,
      features: lang === "uz" ? [
        "PRO tarifidagi barcha imkoniyatlar",
        "Jamoaviy hamkorlik",
        "API orqali ulanish",
        "PDF biznes xulosa hisobotlari",
        "Shaxsiy menejer"
      ] : lang === "ru" ? [
        "Все возможности тарифа PRO",
        "Командная работа",
        "Доступ к API",
        "PDF-отчеты бизнес-сводок",
        "Личный менеджер"
      ] : [
        "Everything in PRO tier",
        "Team Collaboration",
        "API Access",
        "PDF Business Summary Reports",
        "Personal Manager"
      ],
      cta: t.contactSales,
      popular: false
    }
  ];

  return (
    <div id="landing-container" className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500 selection:text-zinc-950 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-50 rounded-lg flex items-center justify-center shadow-md">
              <div className="w-4.5 h-4.5 bg-zinc-950 rounded-sm rotate-45"></div>
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-zinc-50">
              NEXUS AI
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-zinc-500 border-zinc-800 rounded uppercase">
              BETA
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-50 transition-colors">{t.features}</a>
            <a href="#pricing" className="hover:text-zinc-50 transition-colors">{t.pricing}</a>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
              <button 
                id="lang-uz-btn"
                onClick={() => onSetLang("uz")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                  lang === "uz" ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-50"
                }`}
              >
                UZB
              </button>
              <button 
                id="lang-ru-btn"
                onClick={() => onSetLang("ru")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                  lang === "ru" ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-50"
                }`}
              >
                РУС
              </button>
              <button 
                id="lang-en-btn"
                onClick={() => onSetLang("en")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                  lang === "en" ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-50"
                }`}
              >
                ENG
              </button>
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              id="header-login-btn"
              variant="ghost"
              onClick={onLogin}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-50"
            >
              {t.signIn}
            </Button>
            <Button 
              id="header-start-btn"
              onClick={onStart}
              className="bg-gradient-primary rounded-full shadow-md"
            >
              {t.launchDna} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,transparent_60%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900/50 text-zinc-400 px-3.5 py-1.5 rounded-full text-xs font-mono mb-8"
          >
            <Bot className="w-3.5 h-3.5 text-zinc-50" />
            <span>{lang === "uz" ? "AI Business Advisor for Uzbekistan" : lang === "ru" ? "ИИ Бизнес-Советник для Узбекистана" : "AI Business Advisor for Uzbekistan"}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-sans font-medium tracking-tight text-zinc-50 leading-[1.1] mb-6"
          >
            {lang === "uz" ? (
              <>Biz AI chatbot qurmadik. Biz <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent font-extrabold">AI Business Advisor</span> qurdik.</>
            ) : lang === "ru" ? (
              <>Мы не создали ИИ-чатбота. Мы создали <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent font-extrabold">ИИ Бизнес-Советника.</span></>
            ) : (
              <>We didn't build an AI chatbot. We built an <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent font-extrabold">AI Business Advisor.</span></>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            {t.heroSub}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              id="hero-primary-btn"
              onClick={onStart}
              size="lg"
              className="w-full sm:w-auto bg-gradient-primary rounded-full shadow-lg text-base px-8 h-12"
            >
              {lang === "uz" ? "Platformaga Kirish" : lang === "ru" ? "Войти в платформу" : "Enter Platform"} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto rounded-full text-base px-8 h-12 border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900"
            >
              <a href="#features">
                {lang === "uz" ? "Imkoniyatlarni O'rganish" : lang === "ru" ? "Изучить возможности" : "Explore Capabilities"}
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Grid Dashboard Preview Mock */}
      <section className="px-6 pb-24">
        <Card className="max-w-6xl mx-auto border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl shadow-emerald-900/10">
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-800"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-800"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-800"></span>
            <span className="text-xs text-zinc-500 font-mono ml-4">https://nexusai.uz/dashboard</span>
          </div>
          <CardContent className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 opacity-90 pt-8">
            {/* Financials card mock */}
            <Card className="md:col-span-4 border-zinc-800 bg-zinc-900/30 flex flex-col justify-between p-0">
              <CardHeader className="p-5 pb-0">
                <span className="text-[11px] font-mono text-emerald-400 tracking-wider">{lang === "uz" ? "MOLIYAVIY SOG'LOM" : lang === "ru" ? "ФИНАНСОВОЕ ЗДОРОВЬЕ" : "FINANCIAL HEALTH"}</span>
                <CardTitle className="text-lg text-zinc-50 mt-1">{lang === "uz" ? "Byudjet Taqsimoti" : lang === "ru" ? "Распределение Бюджета" : "Budget Allocation"}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-grow">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-zinc-400">Marketing</span> <span className="text-zinc-50">25%</span></div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full"><div className="bg-emerald-400 h-1.5 rounded-full w-[25%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-zinc-400">Inventory</span> <span className="text-zinc-50">35%</span></div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full"><div className="bg-indigo-400 h-1.5 rounded-full w-[35%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-zinc-400">Emergency</span> <span className="text-zinc-50">10%</span></div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full"><div className="bg-orange-400 h-1.5 rounded-full w-[10%]"></div></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <p className="text-xs text-zinc-400 italic">"{lang === "uz" ? "Siz reklamaga 32% sarflayapsiz, raqobatchilar esa 18%. Reklama xarajatlarini kamaytiring." : lang === "ru" ? "Вы тратите 32% на рекламу, а конкуренты - 18%. Сократите рекламные расходы." : "You spend 32% on ads while competitors spend 18%. Reduce ad spending."}"</p>
              </CardFooter>
            </Card>

            {/* AI Mentor card mock */}
            <Card className="md:col-span-5 border-zinc-800 bg-zinc-900/30 p-0">
              <CardHeader className="p-5 pb-0">
                <span className="text-[11px] font-mono text-emerald-400 tracking-wider">{lang === "uz" ? "HAFTALIK AI MENTOR" : lang === "ru" ? "ЕЖЕНЕДЕЛЬНЫЙ ИИ-МЕНТОР" : "WEEKLY AI MENTOR"}</span>
                <CardTitle className="text-lg text-zinc-50 mt-1">{lang === "uz" ? "Joriy haftalik vazifalar" : lang === "ru" ? "Задачи на текущую неделю" : "Current Weekly Tasks"}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><Bot className="w-4 h-4"/></div>
                  <div className="bg-zinc-950/50 border border-zinc-800/50 px-3.5 py-2.5 rounded-lg text-xs text-zinc-300 w-full">
                    <span className="font-semibold text-zinc-50 mb-1 block">{lang === "uz" ? "Tavsiya: Narxlarni qayta ko'rib chiqing" : lang === "ru" ? "Рекомендация: Пересмотрите цены" : "Recommendation: Review Pricing"}</span>
                    {lang === "uz" ? "Aylanma mablag'ingiz past. Premium xizmatlar narxini 10% ga oshirib ko'ring." : lang === "ru" ? "У вас низкий оборот. Попробуйте увеличить цены на премиум-услуги на 10%." : "Your cash flow is low. Try increasing premium service pricing by 10%."}
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0"><Bot className="w-4 h-4"/></div>
                  <div className="bg-zinc-950/50 px-3.5 py-2.5 rounded-lg text-xs text-zinc-300 w-full border border-orange-900/30">
                    <span className="font-semibold text-orange-400 mb-1 block">{lang === "uz" ? "Ogohlantirish: Mijozlar yo'qotilmoqda" : lang === "ru" ? "Предупреждение: Потеря клиентов" : "Warning: Customer Churn"}</span>
                    {lang === "uz" ? "Yangi raqobatchi bozorda paydo bo'ldi. Sodiqlik dasturini joriy qiling." : lang === "ru" ? "На рынке появился новый конкурент. Внедрите программу лояльности." : "A new competitor appeared. Implement a loyalty program."}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Competitors mock */}
            <Card className="md:col-span-3 border-zinc-800 bg-zinc-900/30 flex flex-col justify-between p-0">
              <CardHeader className="p-5 pb-0">
                <span className="text-[11px] font-mono text-emerald-400 tracking-wider">{lang === "uz" ? "LOKATSIYA VA RAQOBAT" : lang === "ru" ? "ЛОКАЦИЯ И КОНКУРЕНТЫ" : "LOCATION & COMPETITION"}</span>
                <CardTitle className="text-lg text-zinc-50 mt-1">{lang === "uz" ? "Bozor tahlili" : lang === "ru" ? "Анализ рынка" : "Market Analysis"}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-grow">
                <div className="space-y-3 font-mono text-xs text-zinc-400">
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1.5"><span>{lang === "uz" ? "Hudud" : lang === "ru" ? "Район" : "District"}</span> <span className="text-zinc-50">Mirobod</span></div>
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1.5"><span>{lang === "uz" ? "Raqobat" : lang === "ru" ? "Конкуренция" : "Competition"}</span> <span className="text-orange-400">Yuqori</span></div>
                  <div className="flex justify-between pb-1.5"><span>{lang === "uz" ? "Potensial" : lang === "ru" ? "Потенциал" : "Potential"}</span> <span className="text-emerald-400">92/100</span></div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <span className="text-[11px] text-zinc-500 italic">"{lang === "uz" ? "Ushbu hududda kafelar ko'p, lekin sifatli dizayn studiyalar yetishmaydi." : lang === "ru" ? "В этом районе много кафе, но не хватает качественных дизайн-студий." : "Many cafes in this area, but lacks quality design studios."}"</span>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{lang === "uz" ? "Platforma Imkoniyatlari" : lang === "ru" ? "Возможности Платформы" : "Platform Capabilities"}</span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold text-zinc-50 tracking-tight mt-2">
              {lang === "uz" ? "Tadbirkorlar Uchun Yagona Markaz" : lang === "ru" ? "Единый Центр Для Предпринимателей" : "The Single Hub for Entrepreneurs"}
            </h2>
            <p className="text-zinc-400 mt-4">
              {lang === "uz" ? "NEXUS AI - sizning biznesingiz haqida qayg'uradigan va kunlik maslahatlar beradigan aqlli yordamchi." : lang === "ru" ? "NEXUS AI - умный помощник, который заботится о вашем бизнесе и дает ежедневные советы." : "NEXUS AI - a smart assistant that cares about your business and gives daily advice."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feat, idx) => (
              <Card 
                key={idx} 
                className="border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all group duration-300"
              >
                <CardHeader>
                  <div className="mb-2 p-2 bg-zinc-900 w-fit rounded-lg border border-zinc-800 group-hover:border-emerald-500/30 transition-all">
                    {feat.icon}
                  </div>
                  <CardTitle className="text-xl text-zinc-50">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400 text-sm leading-relaxed">{feat.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{lang === "uz" ? "SaaS Narxlari" : lang === "ru" ? "Цены SaaS" : "SaaS Pricing"}</span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold text-zinc-50 tracking-tight mt-2">
              {lang === "uz" ? "Shaffof, Qiymatga Asoslangan Tariflar" : lang === "ru" ? "Прозрачные тарифы" : "Transparent, Value-Driven Plans"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`flex flex-col justify-between transition-all relative ${
                  plan.popular 
                    ? "border-emerald-500/50 bg-zinc-900/80 shadow-2xl shadow-emerald-500/5 lg:-translate-y-2 z-10" 
                    : "border-zinc-800 bg-zinc-950/80"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-zinc-50 font-mono tracking-wider uppercase border-none">
                    {lang === "uz" ? "Eng Ommabop" : lang === "ru" ? "Самый Популярный" : "Most Popular"}
                  </Badge>
                )}
                <CardHeader>
                  <CardDescription className="font-mono tracking-wider uppercase mb-1">{plan.name}</CardDescription>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-sans font-bold text-zinc-50 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-zinc-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow border-t border-zinc-800/50 pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="text-sm text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    id={`pricing-${plan.name.split(' ')[0].toLowerCase()}-btn`}
                    onClick={onStart}
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full ${plan.popular ? "bg-gradient-primary border-none text-white hover:opacity-90" : "border-zinc-700 hover:bg-zinc-800"}`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-50 flex items-center justify-center">
              <div className="w-3 h-3 bg-zinc-950 rounded-[2px] rotate-45"></div>
            </div>
            <span className="font-sans font-bold text-sm tracking-tight text-zinc-50">NEXUS AI</span>
            <span className="text-xs text-zinc-500">© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 text-xs text-zinc-500">
            <span>{lang === "uz" ? "Sizning shaxsiy AI Biznes Maslahatchingiz" : lang === "ru" ? "Ваш личный ИИ Бизнес-Советник" : "Your Personal AI Business Advisor"}</span>
            <a href="#landing-container" className="hover:text-zinc-50 transition-colors">{lang === "uz" ? "Tepaga qaytish" : lang === "ru" ? "Наверх" : "Back to top"}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

