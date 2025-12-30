
import { Menu } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";


//header interface created
//contains two variables handling whether user navigate adertising pages
//or whether they click on sign up or sign in
interface HeaderProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

export function header({ onNavigate, onAuthSuccess } : HeaderProps){

    return(
        //to be coded
    )
}
