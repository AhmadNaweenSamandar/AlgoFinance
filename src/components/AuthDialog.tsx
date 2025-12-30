import { useState } from "react";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface AuthDialogProps {

  /**
   * Controls the visibility of the modal.
   * - true: The modal is rendered and visible.
   * - false: The modal is hidden (unmounted).
   * * Controlled by the parent component (Header.tsx).
   */
  open: boolean;

  /**
   * Callback triggered when the modal requests to change its open state.
   * * Usually called with 'false' when the user clicks the backdrop or close button.
   * @param open - The new requested state (usually false).
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Determines which form to display initially when the modal opens.
   * - "login": Shows the Login form.
   * - "signup": Shows the Registration form.
   * * Optional: Defaults to "login" if not provided.
   */
  defaultTab?: "login" | "signup";

  /**
   * Callback function triggered immediately after a successful authentication.
   * * Used to close the modal and redirect the user to the Dashboard.
   */
  onAuthComplete?: () => void;
}


export function AuthDialog({ open, onOpenChange, defaultTab = "login", onAuthComplete }: AuthDialogProps) {

    // =========================================
    // STATE DEFINITIONS
    // =========================================

    // Tracks which view is currently visible ("login" or "signup").
    // Initialized with the prop passed from the Header.
    const [activeTab, setActiveTab] = useState(defaultTab);


    // centralized state for all form inputs.
    // This allows us to handle both Login and Signup data in one place.
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
    });


    // =========================================
    // HANDLERS
    // =========================================

    /**
     * Intercepts the open/close action to perform state cleanup.
     * * Critical UX Feature: If the user opens the modal via "Sign Up" button,
     * this ensures they see the Sign Up tab, even if they were on the Login tab 
     * the last time they used the modal.
     * @param newOpen - The requested visibility state.
     */
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && defaultTab !== activeTab) {
        setActiveTab(defaultTab);
        }
        onOpenChange(newOpen);
    };


    return (
        {/* === ROOT DIALOG COMPONENT === */}
        {/* open / onOpenChange: Binds the modal visibility to the parent's (Header.tsx) state */}
        {/* Dialog component from radix library will be implemented and imported*/}
        {/* Before going futher the dialog ui component implemented and imported*/}
        <Dialog open={open} onOpenChange={handleOpenChange}>

            {/* === MODAL CARD CONTAINER === */}
            {/* sm:max-w-[480px]: Restricts width on tablets/desktop for a focused look.
                p-0: Removes default padding so we can control it manually in children. */}
            <DialogContent className="sm:max-w-[480px] p-0">

                {/* === HEADER SECTION WRAPPER === */}
                {/* p-6: Adds generous padding around the top and sides.
                    pb-0: Removes bottom padding to let the Tabs (coming next) sit closer. */}
                <div className="p-6 pb-0">
                <DialogHeader>
                    {/* Logo & Title Row */}
                    <div className="flex items-center gap-2 mb-2">
                    {/* Logo Icon: A 32px rounded square with Emerald-Teal gradient */}
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg"></div>

                    {/* Main Title (Accessible Name) */}
                    <DialogTitle>AlgoFinance</DialogTitle>
                    </div>
                    {/* Subtitle / Tagline */}
                    <DialogDescription>
                    Manage your finances with AI-powered insights
                    </DialogDescription>
                </DialogHeader>
            </div>
                
            </DialogContent>
        </Dialog>
    );
}