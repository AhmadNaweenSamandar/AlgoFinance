import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import { Sparkles, User, Bot, Send, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import ReactMarkdown from "react-markdown";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

//interface for chat panel component
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  animate?: boolean; // NEW: Tells the UI to use the typewriter effect
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
      "Hi! My name is Gabina, I'm your AI financial assistant. I can help you understand your spending, suggest savings strategies, and answer questions about your finances. How can I help you today?",
    timestamp: new Date(),
  },
];

//sample questions for user to ask
const sampleQuestions = [
  "How can I reduce my spending?",
  "What's my biggest expense?",
  "What's my lowest expense?",
  "Show me dining trends",
];

// THE TYPEWRITER COMPONENT
// This takes a string of markdown and slowly reveals it character by character
// Pass the scrollRef into the component's props
const TypewriterMarkdown = ({
  content,
  scrollRef,
  onComplete, //Fix: text regeneration
}: {
  content: string;
  scrollRef: React.RefObject<HTMLDivElement>;
  onComplete: () => void;
}) => {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedContent("");
    const safeContent = content || "";

    const timer = setInterval(() => {
      setDisplayedContent(safeContent.slice(0, index));
      index += 2; // typing 2 chars at a time makes it look a bit smoother!

      // THE SCROLL FIX: Pull the screen down on every tick!
      // We use "auto" instead of "smooth" to prevent violent stuttering every 15ms
      if (scrollRef && scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "auto" });
      }

      if (index > safeContent.length) {
        clearInterval(timer);
        onComplete(); // THE FIX: Tell the parent component we are done typing!
      }
    }, 15);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, scrollRef]); // We intentionally leave onComplete out to prevent infinite loops

  return <ReactMarkdown>{displayedContent}</ReactMarkdown>;
};

//initial messages for chat panel
export function ChatPanel({}: ChatPanelProps) {
  //state definitions
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // THE BODY SCROLL LOCK
  // This prevents the dashboard from scrolling while the chat pop-up is active
  // UPGRADED: Auto-Scroll Anchor
  // Now triggers on new messages, typing, AND when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      // When opening the modal, wait 10ms for the Portal to render, then snap instantly ("auto")
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 10);
    } else {
      // During normal chatting, scroll smoothly
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isModalOpen]); // NEW: Added isModalOpen to the dependency array

  //The Auto-Scroll Anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Automatically scroll down whenever the 'messages' array changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // --- NEW: 1. Grab the saved financial data from the browser ---
    const savedDataString = sessionStorage.getItem("financialData");
    let financialContext = [];

    // If they uploaded a file, parse the string back into a usable array
    if (savedDataString) {
      financialContext = JSON.parse(savedDataString);
    } else {
      // If they haven't uploaded anything, we can still send an empty array
      console.warn("No financial data found in sessionStorage.");
    }

    //update messages with user input
    // 1. Instantly put the User's message on the screen
    const userMessage: Message = {
      id: Date.now(), //changed to date.now to prevent ID conflicts when messages are added rapidly
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    //update messages state
    // Add it to the array while keeping the old messages
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(""); // Clear the input box

    setIsTyping(true); // TYPING INDICATOR TURN ON

    try {
      // 2. Send JUST this new message to backend API
      const response = await fetch(
        "https://algofinance-api-218961179547.northamerica-northeast1.run.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          // We package the text into a tiny JSON envelope to send it over
          body: JSON.stringify({
            question: userMessage.content, //question is the user's message, financial_context is the uploaded data from the user
            financial_context: financialContext,
          }), //both should be indentical with the backend chat function's expected input!
        },
      );

      const data = await response.json();

      // 3. The backend replies with JSON containing the AI's answer!
      const assistantMessage: Message = {
        id: Date.now() + 1, // Ensure a unique ID that won't conflict with the user's message
        role: "assistant",
        content: data.answer, // The text generated by your Python LLM
        timestamp: new Date(),
        animate: true, //Trigger the typewriter for this specific message!
      };

      // 4. Add the AI's message to the screen
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Chat API broke:", error);
    } finally {
      setIsTyping(false); // TYPING INDICATOR TURN OFF
    }
  };

  // THE ANIMATION KILL SWITCH
  // When a message finishes typing, this permanently disables its typewriter effect
  const handleAnimationComplete = (messageId: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, animate: false } : msg,
      ),
    );
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  // ONE UI TO RULE THEM ALL
  // We put the chat layout in a function so we can render it in the background AND in the pop-up
  const renderChatInterface = (isActive: boolean) => (
    <Card className="h-full flex flex-col relative w-full bg-white shadow-xl">
      <CardHeader className="border-b bg-white rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Gabina</CardTitle>
            <CardDescription>
              Ask me anything about your finances
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* THE SCROLL FIX: Replaced ScrollArea with standard overflow-y-auto */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gray-50/50">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar
                  className={`w-8 h-8 flex-shrink-0 shadow-sm flex items-center justify-center ${message.role === "assistant" ? "bg-emerald-100" : "bg-white border"}`}
                >
                  {message.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <User className="w-4 h-4 text-gray-900" />
                  )}
                </Avatar>

                <div
                  className={`rounded-2xl p-4 max-w-[85%] break-words shadow-sm ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-white border text-gray-900 rounded-tl-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    // THE ASSISTANT TEXT SIZE: Used `prose-base` (standard size) instead `prose-sm` (small size)
                    // THE FIX: Aggressively target the paragraphs and lists to force text-sm
                    <div className="prose prose-sm max-w-none text-sm prose-p:text-sm prose-li:text-sm prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800">
                      {/* THE TYPEWRITER LOGIC: Only animate the message if the flag is true! */}
                      {message.animate ? (
                        <TypewriterMarkdown
                          content={message.content}
                          scrollRef={
                            messagesEndRef
                          } /* THE FIX: Hand the anchor to the typewriter */
                          onComplete={() =>
                            handleAnimationComplete(message.id)
                          } /* THE FIX: Pass the ID to the kill switch */
                        />
                      ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                    </div>
                  ) : (
                    //THE USER SIZE: Used `text-base` (standard size) intead of `text-sm` (small size) to match the assistant!
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0 bg-emerald-100 shadow-sm flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </Avatar>
                <div className="bg-white border rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center h-[44px]">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask Gabina..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  isActive && handleSend(); // Only send if modal is active
                }
              }}
              className="min-h-[60px] resize-none focus-visible:outline-none focus-visible:!ring-2 focus-visible:!ring-emerald-500 focus-visible:!border-emerald-500"
              disabled={!isActive} // Disable typing if we are just looking at the background preview
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || !isActive}
              className="self-end bg-emerald-600 hover:bg-emerald-700 shadow-md transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* THE DASHBOARD PREVIEW  */}
      <div className="relative h-[600px] lg:sticky lg:top-24 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl">
        {renderChatInterface(false)}
        <div
          className="absolute inset-0 z-10 bg-white/5 group-hover:bg-black/5 transition-colors rounded-xl flex items-center justify-center"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-teal text-sm px-4 py-2 rounded-full shadow-lg font-medium"></div>
        </div>
      </div>

      {/* THE FIX: STRICT INLINE STYLES FOR TELEPORTATION */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          >
            {/* Click outside to close */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              onClick={() => setIsModalOpen(false)}
            />

            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "48rem",
                height: "85vh",
                zIndex: 100000,
              }}
              className="animate-in zoom-in-95 duration-200"
            >
              {/* The Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 md:-right-12 md:top-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Render the FULL ACTIVE CHAT inside the modal! */}
              {renderChatInterface(true)}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
