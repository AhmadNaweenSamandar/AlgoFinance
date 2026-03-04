import { useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { WelcomePopup } from "./components/WelcomePopup";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  //The Parent's vault to hold the JSON data
  const [appData, setAppData] = useState<any>(null);

  // Upgrade the navigation handler to catch the backpack from Hero and pass it to Dashboard
  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      setAppData(data); // Save the JSON to the vault!
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutPage />;
      case "dashboard":
        //Handed the JSON to financialData in the "interface DashboardProps"
        return (
          <Dashboard onNavigate={handleNavigate} financialData={appData} />
        );
      default:
        return (
          <main>
            <Hero onNavigate={handleNavigate} />
            <Features />
            <CTA />
          </main>
        );
    }
  };

  const showHeaderFooter = currentPage !== "dashboard";

  return (
    <div className="min-h-screen bg-white">
      <WelcomePopup />
      {showHeaderFooter && <Header onNavigate={handleNavigate} />}
      {renderPage()}
      {showHeaderFooter && <Footer onNavigate={handleNavigate} />}
      <Toaster />
    </div>
  );
}
