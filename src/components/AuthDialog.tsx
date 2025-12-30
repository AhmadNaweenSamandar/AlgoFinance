import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Mail, Lock, User, Chrome } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

    const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAuth = () => {
        // Simple validation
        if (activeTab === "signup" && !formData.name) {
        toast.error("Please enter your name");
        return;
        }
        if (!formData.email) {
        toast.error("Please enter your email");
        return;
        }
        if (!formData.password) {
        toast.error("Please enter your password");
        return;
        }

        toast.success(activeTab === "login" ? "Logged in successfully!" : "Account created successfully!");
        if (onAuthComplete) {
        onAuthComplete();
        }
    };


    return (
        /* === ROOT DIALOG COMPONENT === */
        /* open / onOpenChange: Binds the modal visibility to the parent's (Header.tsx) state */
        /* Dialog component from radix library will be implemented and imported*/
        /* Before going futher the dialog ui component implemented and imported*/
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
            {/* === TABS CONTROLLER === */}
            {/* value/onValueChange: Binds the view state (Login vs Signup) */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
                {/* --- TAB TRIGGERS (The Toggle Buttons) --- */}
                <div className="px-6">
                    {/* grid-cols-2: Splits the width exactly 50% for each button */}
                    <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                </div>
                

                {/* =========================================
                    LOGIN FORM CONTENT
                    - Only renders when activeTab === 'login'
                    ========================================= */}
                <TabsContent value="login" className="px-6 pb-6 space-y-4 mt-4">
                    <div className="space-y-4">
                    {/* --- EMAIL FIELD --- */}
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        {/* Input Wrapper: 'relative' is required for the absolute icon positioning */}
                        <div className="relative">
                        {/* Icon: Positioned absolutely inside the input box
                            - left-3: Spacing from the left edge.
                            - top-1/2 -translate-y-1/2: Perfectly centers the icon vertically.
                        */}
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        {/* Text Input */}
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"

                            // pl-10: Adds left padding so text starts AFTER the icon
                            className="pl-10"

                            // Controlled Input Binding
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                        </div>
                    </div>
                    
                    {/* --- PASSWORD FIELD --- */}
                    <div className="space-y-2">
                        {/* Header Row: Label + Forgot Password Link */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Password</Label>
                            <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
                                Forgot password?
                            </a>
                        </div>

                        {/* Input Wrapper */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- PRIMARY ACTION BUTTON --- */}
                    <Button className="w-full" size="lg" onClick={handleAuth}>
                          Log In
                        </Button>
                    </div>

                    {/* --- SOCIAL AUTH DIVIDER --- */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                    {/* The Text Overlay (bg-white hides the line behind text) */}
                    <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* --- SOCIAL BUTTONS --- */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Google Button */}
                        <Button variant="outline" className="w-full">
                            <Chrome className="w-4 h-4 mr-2" />
                            Google
                        </Button>
                    {/* GitHub Button */}
                        <Button variant="outline" className="w-full">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="signup" className="px-6 pb-6 space-y-4 mt-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="signup-name"
                                type="text"
                                placeholder="John Doe"
                                className="pl-10"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="signup-password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                        Must be at least 8 characters with a number and special character
                        </p>
                    </div>

                     <Button className="w-full" size="lg" onClick={handleAuth}>
                        Create Account
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </Button>
                </div>


                <p className="text-xs text-center text-gray-500">
                    By signing up, you agree to our{" "}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                        Privacy Policy
                    </a>
                </p>

            </TabsContent>
            </Tabs>


            </DialogContent>
            
        </Dialog>
    );
}