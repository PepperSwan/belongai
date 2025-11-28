import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, Shield, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdviceResult {
  barriers: string[];
  strategies: string[];
  resources: string[];
  encouragement: string;
}

const BreakingBarriers = () => {
  const [background, setBackground] = useState("");
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const communities = [
    "Women and minority genders",
    "Ethnic minorities",
    "LGBTQ+ community",
    "Elderly individuals",
    "People with disabilities",
    "Neurodivergent individuals"
  ];

  const handleGetAdvice = async () => {
    if (!background.trim()) {
      toast({
        title: "Tell us about yourself",
        description: "Please share which community you identify with to get personalized advice.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('breaking-barriers-advice', {
        body: { background }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAdvice(data.advice);
      toast({
        title: "Advice Ready!",
        description: "Your personalized guidance is below.",
      });
    } catch (error) {
      console.error('Error getting advice:', error);
      toast({
        title: "Error",
        description: "Failed to get advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Breaking Barriers</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Advice and support for underrepresented groups entering tech
            </p>
          </div>

          {/* Communities We Support */}
          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              We're Here For You
            </h2>
            <p className="text-muted-foreground mb-6">
              We provide guidance and support for people from all underrepresented backgrounds in tech, including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {communities.map((community, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{community}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Get Personalized Advice */}
          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              Get Personalized Advice
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tell us about your background and what barriers you're facing
                </label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full min-h-[150px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., I'm a woman in my 40s wanting to transition into tech but worried about ageism and being taken seriously. I also have family responsibilities that make traditional education difficult..."
                  disabled={loading}
                />
              </div>

              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleGetAdvice}
                disabled={loading}
              >
                <Shield className="mr-2 w-5 h-5" />
                {loading ? "Getting Advice..." : "Get Personalized Advice"}
              </Button>
            </div>
          </div>

          {/* Advice Results */}
          {advice && (
            <div className="space-y-6 animate-fade-in">
              {/* Common Barriers */}
              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-secondary" />
                  Barriers You Might Face
                </h3>
                <ul className="space-y-3">
                  {advice.barriers.map((barrier, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-secondary">•</span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategies to Overcome */}
              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  Strategies to Overcome These Barriers
                </h3>
                <ul className="space-y-3">
                  {advice.strategies.map((strategy, index) => (
                    <li key={index} className="flex gap-3">
                      <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources & Communities */}
              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-success" />
                  Resources & Communities
                </h3>
                <ul className="space-y-3">
                  {advice.resources.map((resource, index) => (
                    <li key={index} className="flex gap-3">
                      <Heart className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Encouragement */}
              <div className="card-base p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <p className="text-lg leading-relaxed">{advice.encouragement}</p>
                <Link to="/path-match" className="block mt-6">
                  <Button className="w-full">
                    Find Your Path Match
                    <ArrowLeft className="ml-2 w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakingBarriers;
