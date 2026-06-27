import { useState } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import BusinessDNAWizard from "./components/BusinessDNAWizard";
import Dashboard from "./components/Dashboard";
import { BusinessDNA } from "./types";
import { Language } from "./translations";

type AppScreen = "landing" | "auth" | "wizard" | "dashboard";

export default function App() {
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("nexus_user_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [dna, setDna] = useState<BusinessDNA | null>(() => {
    const saved = localStorage.getItem("nexus_dna");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (userProfile && dna) return "dashboard";
    if (userProfile && !dna) return "wizard";
    return "landing";
  });
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("nexus_lang");
    return (saved as Language) || "uz";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("nexus_lang", newLang);
  };
  
  const handleSetDna = (compiledDna: BusinessDNA | null) => {
    setDna(compiledDna);
    if (compiledDna) {
      localStorage.setItem("nexus_dna", JSON.stringify(compiledDna));
    } else {
      localStorage.removeItem("nexus_dna");
    }
  };

  const handleSetUserProfile = (profile: { name: string; email: string } | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem("nexus_user_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("nexus_user_profile");
    }
  };

  const handleStart = () => {
    if (userProfile) {
      setScreen("wizard");
    } else {
      setScreen("auth");
    }
  };

  const handleAuthSuccess = (profile: { name: string; email: string }) => {
    handleSetUserProfile(profile);
    if (dna) {
      setScreen("dashboard");
    } else {
      setScreen("wizard");
    }
  };

  const handleWizardSubmit = (compiledDna: BusinessDNA) => {
    handleSetDna(compiledDna);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    handleSetUserProfile(null);
    handleSetDna(null);
    setScreen("landing");
  };

  const handleStartOver = () => {
    handleSetDna(null);
    setScreen("wizard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans antialiased">
      {screen === "landing" && (
        <LandingPage 
          onStart={handleStart} 
          onLogin={() => setScreen("auth")} 
          lang={lang}
          onSetLang={handleSetLang}
        />
      )}

      {screen === "auth" && (
        <AuthPage 
          onBack={() => setScreen("landing")} 
          onSuccess={handleAuthSuccess} 
          lang={lang}
        />
      )}

      {screen === "wizard" && (
        <BusinessDNAWizard 
          onComplete={handleWizardSubmit} 
          lang={lang}
        />
      )}

      {screen === "dashboard" && userProfile && dna && (
        <Dashboard 
          dna={dna} 
          userProfile={userProfile} 
          onStartOver={handleStartOver} 
          onLogout={handleLogout}
          lang={lang}
        />
      )}
    </div>
  );
}
