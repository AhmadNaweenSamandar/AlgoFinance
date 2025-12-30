
import { Menu } from "lucide-react";
import { useState } from "react";


//header interface created
//contains two variables handling whether user navigate adertising pages
//or whether they click on sign up or sign in
interface HeaderProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}


/**
 * Header Component
 * * The main navigation bar for the landing page.
 * * Handles navigation, mobile menu toggling, and opening the Auth Modal.
 */
export function header({ onNavigate, onAuthSuccess } : HeaderProps){


    // =========================================
    // State Definitions
    // =========================================


    // Controls visibility of the mobile slide-down menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Controls visibility of the Login/Signup Modal overlay
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

    // Tracks which mode to show initially (though LoginSignup handles toggling internally)
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");


    // =========================================
    // Handlers
    // =========================================


    /**
   * Opens the Auth Modal with the specific mode.
   * Closes mobile menu to prevent UI clutter.
   */
    const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
    setMobileMenuOpen(false);
    };


    /**
      * Handles navigation to different sections (e.g., Features, About).
      */
    const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    };


    /**
      * Called when LoginSignup component reports success.
      */
    const handleAuthComplete = () => {
    setAuthDialogOpen(false);
    onAuthSuccess();
    };

    return(
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>

                    {/* Logo Icon: A 32x32px rounded square with a Green/Teal gradient */}
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg"></div>

                    {/* Application Name */}
                    <span className="text-xl">AlgoFinance</span>
                </div>

                

            </div>
        </header>
    )
}
