import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PathMatch = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Path Match</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover how your current skills translate to your dream tech role
            </p>
          </div>

          <div className="card-base p-8">
            <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your current experience level?
                </label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., I've worked in customer service for 3 years, managed social media for small businesses..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What skills do you already have?
                </label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., Communication, problem-solving, basic Excel, organizing events..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What tech role are you interested in?
                </label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., Product Manager, UX Designer, Data Analyst..."
                />
              </div>

              <Button size="lg" className="w-full">
                <Sparkles className="mr-2 w-5 h-5" />
                Find My Path Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathMatch;
