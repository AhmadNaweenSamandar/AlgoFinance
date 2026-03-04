import { useState } from "react";
import { Download, X } from "lucide-react";

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(true);

  // If the popup is closed, render nothing
  if (!isOpen) return null;

  return (
    // The dark background overlay
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* styling for the square */}
      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-2xl p-8 md:p-12 relative max-w-md w-full">
        {/* Close Button (Top Right) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Text Content */}
        <div className="text-center mb-8 mt-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to AlgoFinance!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Want to see the AI in action but don't have a statement handy?
            Download our safe, sample bank statement to instantly test the
            dashboard and chat with Gabina.
          </p>
        </div>

        {/* Download Button (Centered at bottom) */}
        <div className="flex justify-center">
          {/* The 'download' attribute forces the browser to download the file instead of opening it */}
          <a
            href="/sample-statement.pdf"
            download="AlgoFinance_Sample_Statement.pdf"
            onClick={() => setIsOpen(false)} // Optional: close popup after clicking download
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            Download Sample
          </a>
        </div>
      </div>
    </div>
  );
}
