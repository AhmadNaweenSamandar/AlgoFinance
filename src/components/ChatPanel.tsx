import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Sparkles } from "lucide-react";

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

//sample questions for user to ask
const sampleQuestions = [
  "How can I reduce my spending?",
  "What's my biggest expense?",
  "Am I on track for my savings goal?",
  "Show me dining trends",
];

//initial messages for chat panel
export function ChatPanel({ onNavigate }: ChatPanelProps) {
  //state definitions
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    //update messages with user input
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    //update messages state
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    // In real implementation, this would be an API call
    setTimeout(() => {
      const aiResponse = generateResponse(input);
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  //function to generate mock ai response based on user question
  const generateResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes("reduce") || lowerQ.includes("save")) {
      return "Based on your spending patterns, here are my top 3 recommendations:\n\n1. **Shopping**: You spent $412.89 this month (24% of expenses). Try setting a monthly limit of $300.\n\n2. **Dining Out**: At $245.67, consider meal prepping to cut this by 30-40%.\n\n3. **Subscriptions**: Review your $67.94/month in subscriptions - you might find services you no longer use.\n\nImplementing these could save you ~$300/month!";
    }

    if (lowerQ.includes("biggest") || lowerQ.includes("most")) {
      return "Your biggest expense category this month is **Shopping** at $412.89 (24% of total spending). This is 18% higher than last month. Would you like tips on reducing shopping expenses?";
    }

    if (lowerQ.includes("goal") || lowerQ.includes("track")) {
      return "Great news! You're saving 61.3% of your income ($2,760.58 this month). At this rate:\n\n✅ Emergency fund ($10,000): 4 months\n✅ Vacation fund ($3,000): 1.5 months\n✅ New laptop ($2,000): 1 month\n\nYou're doing excellent! Keep up the momentum.";
    }

    if (lowerQ.includes("dining") || lowerQ.includes("food")) {
      return "Your dining spending breakdown:\n\n🍽️ **Restaurants**: $182.45 (74%)\n🍕 **Fast Food**: $43.22 (18%)\n☕ **Coffee Shops**: $20.00 (8%)\n\n**Trend**: Up 15% from last month. Consider setting a weekly dining budget of $50 to bring this down.";
    }

    return "I've analyzed your question. Based on your current financial data, you're in a strong position with a 61.3% savings rate. Your top spending categories are Shopping (24%), Groceries (22%), and Utilities (16%). Is there a specific area you'd like me to dive deeper into?";
  };

  return (
    // Chat Panel Card
    <Card className="h-[600px] lg:sticky lg:top-24 flex flex-col">
      {/* Card Header with Title and Description */}
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Ask me anything about your finances
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
