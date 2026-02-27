import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  // =========================================
  // HANDLERS
  // =========================================

  /**
   * Primary Action: Scroll to the upload section on the home page
   */
  const handleStartFree = () => {
    // Scroll to the upload section on the home page
    document
      .getElementById("file-upload-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        {/* === CARD CONTAINER === */}
        {/* bg-gradient-to-br: Creates the rich Emerald-to-Teal background.
            relative overflow-hidden: Essential for containing the decorative blobs.
            text-white: Ensures all text inside is readable against the dark gradient.
        */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          {/* --- DECORATIVE BACKGROUND BLOBS --- */}
          {/* Top-Right Blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          {/* Bottom-Left Blur */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          {/* --- CONTENT LAYER --- */}
          {/* relative z-10: Lifts content above the background blobs */}
          <div className="relative z-10">
            <h2 className="text-white mb-4">
              Ready to Understand Your Finances?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              AlgoFinance helps you understand your finances and spend smarter with out any cost.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={handleStartFree}
              >
                I'm interested
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            {/* Trust Signals / Footer Text */}
            <p className="text-sm text-emerald-100 mt-6">
              AlgoFinance • Personal project equipped with Machine Learning & Artifical Intelligence
            </p>
            <p className="text-sm text-emerald-100 mt-6">
              Made with ❤️ by <b>Ahmad
              Naween Samandar</b>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
