import { useState } from "react";

//interface for chat panel component
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

//chat panel props
interface ChatPanelProps {
  onNavigate: (page: string) => void;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi! I'm your AI financial advisor. I can help you understand your spending, suggest savings strategies, and answer questions about your finances. What would you like to know?",
    timestamp: new Date(),
  },
];

//initial messages for chat panel
export function ChatPanel({ onNavigate }: ChatPanelProps) {
  //state definitions
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
}
