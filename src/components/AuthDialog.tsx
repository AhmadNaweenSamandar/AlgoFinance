import { useState } from "react";
import { Button } from "./ui/button";
import { Mail, Lock, User, Chrome } from "lucide-react";

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

    return (
        //to be coded
    )
}