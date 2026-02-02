import { useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutPage />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
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
      {showHeaderFooter && <Header onNavigate={handleNavigate} />}
      {renderPage()}
      {showHeaderFooter && <Footer onNavigate={handleNavigate} />}
      <Toaster />
    </div>
  );
}
