import { Button } from "./ui/button";
import { Upload, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

//interface for second part of the main page
//it control page navigation
interface HeroProps {
  onNavigate?: (page: string, data?: unknown) => void;
}

// The custom animated loader component
const TypewriterLoader = ({ fileName }: { fileName: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const steps = [
      `Extracting data from ${fileName}...`,
      "Normalizing financial data...",
      "Predicting categories...",
      "Generating dashboard...",
    ];

    if (currentStep >= steps.length) return;

    const fullText = steps[currentStep];
    let currentCharIndex = 0;

    // 1. The Typing Effect (types one letter every 30ms)
    const typingInterval = setInterval(() => {
      setDisplayText(fullText.substring(0, currentCharIndex + 1));
      currentCharIndex++;

      // 2. When the sentence finishes typing
      if (currentCharIndex === fullText.length) {
        clearInterval(typingInterval);

        // 3. Wait exactly 0.3 seconds (300ms), then clear and start the next step
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setDisplayText(""); // Erase text
            setCurrentStep((prev) => prev + 1); // Move to next step
          }
        }, 280);
      }
    }, 20); // Typing speed: 30ms per character

    return () => clearInterval(typingInterval);
  }, [currentStep, fileName]);

  return <span className="font-medium">{displayText}</span>;
};

export function Hero({ onNavigate }: HeroProps = {}) {
  // =========================================
  // STATE: INTERACTION & DATA
  // =========================================

  // Visual state for the Drag-and-Drop zone (true = user is hovering file over area)
  const [isDragging, setIsDragging] = useState(false);
  //NEW: State to track when the backend is crunching the numbers
  const [isUploading, setIsUploading] = useState(false);

  // =========================================
  // HANDLERS: FILE UPLOAD (DRAG & DROP)
  // =========================================

  /**
   * Unified handler for both Drag-and-Drop AND Click-to-Upload.
   */
  const handleFileUpload = async (
    //async because we will be doing network requests
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLLabelElement>,
  ) => {
    e.preventDefault();
    setIsDragging(false);

    let file: File | null = null;
    if ("dataTransfer" in e) {
      file = e.dataTransfer.files[0];
    } else if (e.target.files) {
      file = e.target.files[0];
    }

    if (!file) return; //if no file, stop here.

    // 1. START THE LOADING UX
    setIsUploading(true);

    // 2. Trigger the typewriter component inside the toast and save the ID!
    const toastId = toast.loading(<TypewriterLoader fileName={file.name} />);

    try {
      //2. PACKAGE THE FILE (as like a Digital Envelope)
      // FormData is the only way to send binary files over HTTP
      const formData = new FormData();
      // the uploaded file is appended to the form data with the key "file"
      formData.append("file", file); // "file" must exactly match FastAPI parameter

      // 3. SEND TO BACKEND (The Waiter)
      // Replace with your actual backend URL if different (/uploaid-statement is the FastAPI endpoint we created)
      const response = await fetch(
        //https://algofinance-api-218961179547.northamerica-northeast1.run.app
        "http://127.0.0.1:8000/api/upload-statement",
        {
          method: "POST",
          body: formData, // Notice we don't set 'Content-Type' headers for FormData, the browser does it automatically!
        },
      );

      if (!response.ok) {
        throw new Error("Backend failed to process the statement.");
      }

      // 4. RECEIVE THE MEAL
      const dashboardData = await response.json();
      console.log("Success from Backend:", dashboardData);

      // issue: the frontend was sending whole dashboardData to sessionStorage, which included not only the transactions array
      // but also charts and insights, which caused 422 error (wrong type)
      // THE FIX: we extract the transactions array from the dashboardData and save it to sessionStorage
      const transactionsArray = dashboardData.transactions;

      // Now we only save the pure transaction list to memory!
      sessionStorage.setItem(
        "financialData",
        JSON.stringify(transactionsArray),
      );

      console.log("Success from Backend:", dashboardData);

      toast.dismiss(); // Clear the loading toast
      toast.success("Analysis complete!");

      // 5. NAVIGATE AND PASS DATA
      // we need to pass this 'dashboardData' to our Dashboard component!
      if (onNavigate) {
        // this is helping to pass data to dashboard through app.tsx
        //this onNavigate act as a backpack that now add the dashboardData to it, which included the JSON data generated by backend
        onNavigate("dashboard", dashboardData);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.dismiss();
      toast.error("Oops! Something went wrong analyzing your file.");
    } finally {
      // 6. CLEANUP
      // Whether it succeeded or failed, turn off the loading state
      setIsUploading(false);
    }
  };

  /**
   * Visual feedback when dragging enters the zone.
   */
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    setIsDragging(true);
  };

  /**
   * Reset visual feedback when dragging leaves.
   */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleGetStarted = () => {
    // Scroll to the upload section
    document
      .getElementById("file-upload-section")
      ?.scrollIntoView({ behavior: "smooth" });
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
          Gabina, our smart chatbot help you
          {/* Gradient Text Technique:
              - bg-gradient-to-r: Sets the gradient colors.
              - bg-clip-text: Clips the background to the shape of the text.
              - text-transparent: Makes the text fill invisible so the background shows through.
          */}
          <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Understand your Finances!
          </span>
        </h1>
        {/* Subheadline */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload your monthly bank statement and let our machine learning
          algorithms automatically categorize spending, create overview charts,
          and provide smart insights with Artifical Inteligence.
        </p>

        {/* === CTA BUTTONS === */}
        {/* flex-col sm:flex-row: Vertical stack on mobile, horizontal on desktop */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="gap-2" onClick={handleGetStarted}>
            <Upload className="w-5 h-5" />
            Start Now
          </Button>
        </div>

        {/* === INTERACTIVE DEMO AREA (Drop Zone) === */}
        <div id="file-upload-section" className="relative mt-12">
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
                accept=".csv,.xlsx,.xls,.pdf,.ofx,.qfx" // Restrict to financial formats
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Visual Feedback Icons & Text */}
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-emerald-600" : "text-gray-400"}`}
              />
              <p className={isDragging ? "text-emerald-600" : "text-gray-600"}>
                Drop your bank statement here or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports Excel, and PDF files from all major banks
              </p>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
