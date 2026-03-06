import { Download, Menu } from "lucide-react";
import { useEffect, useState } from "react";
//THE FIX (Step 1): Import the actual file from assets folder!
import algoFinanceLogo from "../assets/algo.jpg";
import { Button } from "./ui/button";

//header interface created
//contains two variables handling whether user navigate adertising pages
//or whether they click on sign up or sign in
interface HeaderProps {
  onNavigate: (page: string) => void;
}

/**
 * Header Component
 * * The main navigation bar for the landing page.
 * * Handles navigation, mobile menu toggling, and opening the Auth Modal.
 */
export function Header({ onNavigate }: HeaderProps) {
  // =========================================
  // State Definitions
  // =========================================

  // Controls visibility of the mobile slide-down menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================================
  // State to receive signal from Hero that pop up is closed
  // and to show the "Download Sample Statement" button in the header
  // =========================================
  // 1. State to control the button visibility
  const [showSampleBtn, setShowSampleBtn] = useState(false);

  // 2. Listen for the signal or check memory on load
  useEffect(() => {
    console.log(
      "Header loaded. Storage check:",
      localStorage.getItem("hasSeenPopup"),
    );
    // If they refresh the page after already closing the popup, show it immediately
    if (localStorage.getItem("hasSeenPopup")) {
      setShowSampleBtn(true);
    }

    // Listen for the exact moment the Landing Page fires the "popupClosed" signal
    const handleSignal = () => {
      console.log("3. Signal received by Header!");
      setShowSampleBtn(true);
    };
    window.addEventListener("popupClosed", handleSignal);

    // Cleanup the listener
    return () => window.removeEventListener("popupClosed", handleSignal);
  }, []);

  // =========================================
  // Handlers
  // =========================================
  /**
   * Handles navigation to different sections (e.g., Features, About).
   */
  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    //to be coded

    // === CONTAINER STYLING ===
    // border-b: Adds a subtle separation line at the bottom.
    // bg-white/80: Sets background to white with 80% opacity.
    // backdrop-blur-sm: Blurs content behind the header (Glassmorphism).
    // sticky top-0: Keeps the header pinned to the top while scrolling.
    // z-50: High stack order ensures it floats above all other page content.
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      {/* === INNER LAYOUT === */}
      {/* container mx-auto: Centers content horizontally with max-width constraints. */}
      {/* flex...justify-between: Pushes the Logo to the left and (future) Nav links to the right. */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* === LOGO SECTION === */}
        {/* Clickable area that triggers navigation to 'home' */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleNavClick("home")}
        >
          {/* Logo Icon Container */}
          {/* THE FIX (Step 2): Added overflow-hidden to maintain rounded corner mask */}
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white p-0.5 shadow-inner">
            <img
              src={algoFinanceLogo} // The imported variable from Step 1
              alt="AlgoFinance Logo"
              // THE FIX (Step 3): 'object-contain' forces logo to fit perfectly within the 32px box without cropping or stretching
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Application Name */}
          <span className="text-xl">AlgoFinance</span>
        </div>

        {/* Desktop Navigation */}
        {/* hidden md:flex: 
                    - Mobile: Hidden (display: none).
                    - Desktop: Visible (display: flex) to show links horizontally. 
                */}
        <nav className="hidden md:flex items-center gap-6">
          {/* THE NEW DESKTOP BUTTON */}
          {showSampleBtn && (
            <a
              href="/SampleBankStatement.pdf"
              download="SampleBankStatement.pdf"
              className="animate-in fade-in duration-500"
            >
              <Button variant="outline" size="sm" className="gap-2 rounded-md">
                <Download className="w-4 h-4" />
                Sample Statement
              </Button>
            </a>
          )}
          <button
            onClick={() => handleNavClick("about")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </button>
        </nav>

        {/* Mobile Menu Button */}
        {/*Sets mobile menu to visible*/}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {/* === MOBILE MENU DROPDOWN === */}
      {/* Conditional Rendering: Only renders if 'mobileMenuOpen' state is true */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          {/* Container:
                    - md:hidden: CRITICAL. Ensures this menu vanishes if user resizes to desktop width.
                    - border-t: Adds visual separation from the main header bar.
                */}
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {/* THE NEW MOBILE BUTTON */}
            {showSampleBtn && (
              <a
                href="/SampleBankStatement.pdf"
                download="SampleBankStatement.pdf"
                className="animate-in fade-in duration-500"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-md"
                >
                  <Download className="w-4 h-4" />
                  Sample Statement
                </Button>
              </a>
            )}
            {/* Navigation Links (Vertical Stack) */}
            <button
              onClick={() => handleNavClick("about")}
              className="text-gray-600 hover:text-gray-900 text-left"
            >
              About
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
