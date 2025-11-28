import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Shield, Lightbulb, Loader2 } from "lucide-react";

interface AdviceResult {
  barriers: string[];
  strategies: string[];
  resources: string[];
  encouragement: string;
}

const BreakingBarriers = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const communities = [
    "Women and minority genders",
    "Ethnic minorities",
    "LGBTQ+ community",
    "Elderly individuals",
    "People with disabilities",
    "Neurodivergent individuals (SEN)"
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadPreviousResults();
    }
  }, [user]);

  const loadPreviousResults = async () => {
    try {
      const { data, error } = await supabase
        .from("breaking_barriers_results")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPreviousResults(data || []);
    } catch (error: any) {
      console.error("Error loading previous results:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !experience.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select your background and share your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("breaking-barriers-advice", {
        body: {
          backgroundCategory: selectedCategory,
          experience: experience,
        },
      });

      if (error) throw error;

      setAdvice(data.advice);

      // Save to database
      const { error: saveError } = await supabase
        .from("breaking_barriers_results")
        .insert({
          user_id: user?.id,
          background_category: selectedCategory,
          experience: experience,
          barriers: data.advice.barriers,
          strategies: data.advice.strategies,
          resources: data.advice.resources,
          encouragement: data.advice.encouragement,
        });

      if (saveError) throw saveError;

      await loadPreviousResults();

      toast({
        title: "Advice Generated",
        description: "Your personalized guidance is ready!",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
          {previousResults.length > 0 && (
            <Button variant="ghost" onClick={() => setShowPrevious(!showPrevious)}>
              {showPrevious ? "Hide" : "View"} Previous Results ({previousResults.length})
            </Button>
          )}
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Breaking Barriers</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Get personalized advice and support for your tech journey
          </p>
        </div>

        {showPrevious && previousResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Previous Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previousResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setAdvice({
                      barriers: result.barriers,
                      strategies: result.strategies,
                      resources: result.resources,
                      encouragement: result.encouragement,
                    });
                    setSelectedCategory(result.background_category);
                    setExperience(result.experience);
                    setShowPrevious(false);
                  }}
                >
                  <p className="font-medium">{result.background_category}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              We're Here For You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We provide guidance and support for people from all underrepresented backgrounds in tech:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {communities.map((community, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === community
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCategory(community)}
                >
                  <Heart className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{community}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Get Personalized Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tell us about your background and what barriers you're facing
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full min-h-[150px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., I'm a woman in my 40s wanting to transition into tech but worried about ageism and being taken seriously. I also have family responsibilities that make traditional education difficult..."
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Getting Advice...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 w-5 h-5" />
                    Get Personalized Advice
                  </>
                )}
              </Button>
            </form>

            {advice && (
              <div className="space-y-6 mt-8 animate-fade-in">
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

                <div className="card-base p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <p className="text-muted-foreground leading-relaxed">{advice.encouragement}</p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => {
                      setAdvice(null);
                      setSelectedCategory("");
                      setExperience("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Start New Assessment
                  </Button>
                  <Button
                    onClick={() => navigate("/path-match")}
                    className="flex-1"
                  >
                    Continue to Path Match →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BreakingBarriers;
