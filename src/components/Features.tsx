import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Brain, PiggyBank, Target, TrendingUp, Shield, Tag } from "lucide-react";



// === DATA CONFIGURATION ===
// Defines the content for the grid. 
// Easy to extend without touching the JSX below.
const features = [
  {
    icon: Brain,
    title: "ML Categorization",
    description: "Machine learning automatically categorizes every transaction with high accuracy.",
  },
  {
    icon: TrendingUp,
    title: "Spending Insights",
    description: "Get detailed insights into your spending patterns and identify areas to save.",
  },
  {
    icon: PiggyBank,
    title: "Monthly Savings Tracker",
    description: "Track your monthly savings goals and see your progress over time.",
  },
  {
    icon: Target,
    title: "Goal-Based Advice",
    description: "Receive personalized financial suggestions based on your specific goals.",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your financial data is encrypted and never shared. Complete privacy guaranteed.",
  },
  {
    icon: Tag,
    title: "Custom Categories",
    description: "Create and manage custom spending categories tailored to your lifestyle.",
  },
];

export function Features() {
  return (

    // === SECTION WRAPPER ===
    // bg-gray-50: Light gray background separates this from the white Hero section.
    // py-16: Generous vertical padding for breathing room.
    <section id="features" className="container mx-auto px-4 py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* === SECTION HEADER === */}
        <div className="text-center mb-12">
          <h2 className="mb-4">
            Smart Features for Better Money Management
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to understand and optimize your spending
          </p>
        </div>


        {/* === FEATURES GRID === */}
        {/* grid-cols-1: Mobile default (stacked).
            md:grid-cols-2: Tablet/Desktop (2 columns side-by-side).
            gap-6: Consistent spacing between cards.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {

            // Extract the specific icon component for this feature
            const Icon = feature.icon;
            return (
              <Card key={index} 
              // === INTERACTIVE CARD STYLING ===
                // border-2: Thicker border for better definition.
                // hover:border-emerald-200: Subtle color change on hover.
                // hover:shadow-lg: Lift effect on hover.
                // transition-all: Smooths out the hover animations.
              className="border-2 hover:border-emerald-200 transition-all hover:shadow-lg">
                <CardHeader>

                  {/* Icon Container */}
                  {/* bg-emerald-100: Creates the soft colored square background. */}
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}