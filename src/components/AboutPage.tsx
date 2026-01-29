import { Card, CardContent } from "./ui/card";
import { Target } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">
              About
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                AlgoFinance
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              This website is built to implemented personal finance analysis with ML/AI technologies. It takes raw data in the form 
              of a bank statement or excel file and create simple dashboard and analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2>Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4">
                 My goal is to practice new technology stacks
              and skills such as Python ML libraries, Algorithm Analysis, Data Parsing and Chatbot modeling in my software engineering journey.
              </p>
              <p className="text-lg text-gray-600">
                Frontend technologies such as React.js and CSS Tailwind combined with PyTourch creates an unique personnal finance analyzer.
              </p>
            </div>
            <div className="flex-1">
              <Card className="border-2 shadow-xl">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg p-8 h-64 flex items-center justify-center">
                    <Target className="w-24 h-24 text-emerald-600/40" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="mb-4">Meet the Founder and Product Engineer</h2>
            <p className="text-xl text-gray-600">
              The person building AlgoFinance
            </p>
          </div>

          <div className="flex justify-center mt-12">
            <Card className="border-2 text-center hover:border-emerald-200 transition-all max-w-sm">
              <CardContent className="p-6">
                <Avatar className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-600 to-teal-600">
                  <AvatarFallback className="text-white text-xl">ANS</AvatarFallback>
                </Avatar>
                <h4 className="mb-1">Ahmad Naween Samandar</h4>
                <p className="text-sm text-emerald-600 mb-3">Founder & Product Engineer</p>
                <p className="text-sm text-gray-600">Software Engineering Student at University of Ottawa</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4">Take out your time and test my application.</h2>
          <p className="text-xl text-gray-600 mb-8">
            It doesn't matter if you're a student or a recruiter, you can find everything of your interest!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">
                    Start here
            </button>
            <button className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:border-emerald-300 transition-all">
                Visit my Website
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}