import { Button } from "./ui/button";
import { Upload, Sparkles } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";


//interface for second part of the main page
//it control page navigation
interface HeroProps {
  onNavigate?: (page: string) => void;
  onAuthSuccess?: () => void;
}

export function Hero({ onNavigate, onAuthSuccess }: HeroProps = {}) {

  // =========================================
  // STATE: INTERACTION & DATA
  // =========================================


  // Visual state for the Drag-and-Drop zone (true = user is hovering file over area)
  const [isDragging, setIsDragging] = useState(false);

  // Controls the visibility of the Auth Modal
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  // CRITICAL: Stores the uploaded bank statement temporarily.
  // This allows the user to drop a file -> Sign Up -> Then have the file ready 
  // on the dashboard immediately after login.
  const [pendingFile, setPendingFile] = useState<File | null>(null);


  // =========================================
  // HANDLERS: AUTHENTICATION
  // =========================================


  /**
   * Opens the modal to a specific tab (Login or Signup).
   */
  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  /**
   * Callback triggered after successful Login/Signup.
   * Handles the transition from Landing Page -> Dashboard.
   */

  const handleAuthComplete = () => {
    setAuthDialogOpen(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
    // Notify parent component (usually to update global user state)
    // while there's a pending file, navigate to dashboard
    if (pendingFile && onNavigate) {
      setTimeout(() => {
        onNavigate('dashboard');
      }, 500);
    }
  };

  

    return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* === PILL BADGE === */}
        {/* Small highlight element above the main headline */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">ML-Powered Financial Intelligence</span>
        </div>
        

        {/* === MAIN HEADLINE === */}
        <h1 className="mb-6">
          Take Control of Your Finances with
          {/* Gradient Text Technique:
              - bg-gradient-to-r: Sets the gradient colors.
              - bg-clip-text: Clips the background to the shape of the text.
              - text-transparent: Makes the text fill invisible so the background shows through.
          */}
          <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Smart Spending Insights
          </span>
        </h1>
        {/* Subheadline */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload your bank transactions and let our machine learning algorithms automatically categorize spending, 
          track savings, and provide personalized financial advice.
        </p>
        

        {/* === CTA BUTTONS === */}
        {/* flex-col sm:flex-row: Vertical stack on mobile, horizontal on desktop */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="gap-2" onClick={() => handleAuthClick("signup")}>
            <Upload className="w-5 h-5" />
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" onClick={() => handleAuthClick("login")}>
            Try Demo
          </Button>
        </div>

        {/* === INTERACTIVE DEMO AREA (Drop Zone) === */}
        <div className="relative mt-12">
          {/* Background Glow Effect:
              - absolute inset-0: Fills the container.
              - blur-3xl: Heavily blurs the gradient to create a soft glow.
              - -z-10: Pushes it behind the content.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 blur-3xl -z-10"></div>
          {/* The Upload Card */}
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-2xl p-8 md:p-12">
            {/* The Drop Target 
                - Using a <label> allows clicking anywhere in the box to trigger the hidden file input.
            */}
            <label 
              htmlFor="file-upload"
              // Drag Events to handle state toggling
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileUpload}
              // Conditional Styling:
              // If dragging file over, turn Green (Emerald).
              // If idle, stay Gray/White with hover effects.
              className={`block border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer ${
                isDragging 
                  ? "border-emerald-400 bg-emerald-50" 
                  : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
              }`}
            >
              {/* Hidden Input: The actual form element doing the work */}
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.pdf,.ofx,.qfx"  // Restrict to financial formats
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Visual Feedback Icons & Text */}
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-emerald-600" : "text-gray-400"}`} />
              <p className={isDragging ? "text-emerald-600" : "text-gray-600"}>
                Drop your bank statement here or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports CSV, Excel, PDF, and OFX files from all major banks
              </p>
            </label>
          </div>
        </div>
      </div>
      
      {/* === AUTH DIALOG === */}
      {/* Placed here to be available when CTAs are clicked */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultTab={authMode}
        onAuthComplete={handleAuthComplete}
      />
    </section>
  );
}