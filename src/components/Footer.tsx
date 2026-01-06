interface FooterProps {
  // Callback to handle internal navigation (switching views)
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (

    // === FOOTER CONTAINER ===
    // border-t: Adds a subtle separator line at the top.
    // bg-gray-50: Uses a very light gray to differentiate from the main white content.
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* === RESPONSIVE LAYOUT === */}
        {/* Mobile: Stack vertically (flex-col).
            Desktop (md): Align horizontally to edges (flex-row justify-between). 
        */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          {/* --- LEFT SECTION: NAV & COPYRIGHT --- */}
          <div className="flex items-center gap-6 text-gray-600">

            {/* Internal Navigation Link */}
            <button 
              onClick={() => onNavigate('about')} 
              className="hover:text-gray-900 transition-colors"
            >
              About
            </button>

            {/* Copyright Text */}
            <span>© 2025 AlgoFinance. All rights reserved.</span>
          </div>
          

          {/* --- RIGHT SECTION: SOCIAL LINKS --- */}
          <div className="flex gap-6 text-gray-600">

            {/* External Link: LinkedIn */}
            {/* target="_blank": Opens in new tab.
                rel="noopener noreferrer": Security best practice for new tabs. */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              LinkedIn
            </a>

            {/* External Link: GitHub */}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}