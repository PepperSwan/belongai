import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, Target, Loader2 } from "lucide-react";

interface AnalysisResult {
  matchScore: number;
  transferableSkills: string[];
  skillGaps: string[];
  recommendedPath: string;
  encouragement: string;
}

const PathMatch = () => {
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
        .from("path_match_results")
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
    
    if (!experience.trim() || !skills.trim() || !targetRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to get your path match analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-skills", {
        body: {
          experience,
          skills,
          targetRole,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);

      // Save to database
      const { error: saveError } = await supabase
        .from("path_match_results")
        .insert({
          user_id: user?.id,
          experience,
          skills,
          target_role: targetRole,
          match_score: data.analysis.matchScore,
          transferable_skills: data.analysis.transferableSkills,
          skill_gaps: data.analysis.skillGaps,
          recommended_path: data.analysis.recommendedPath,
          encouragement: data.analysis.encouragement,
        });

      if (saveError) throw saveError;

      await loadPreviousResults();

      toast({
        title: "Analysis Complete!",
        description: "Your personalized path match is ready.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze skills. Please try again.",
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
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Find Your Path Match</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Discover how your skills translate to tech roles
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
                    setAnalysis({
                      matchScore: result.match_score,
                      transferableSkills: result.transferable_skills,
                      skillGaps: result.skill_gaps,
                      recommendedPath: result.recommended_path,
                      encouragement: result.encouragement,
                    });
                    setExperience(result.experience);
                    setSkills(result.skills);
                    setTargetRole(result.target_role);
                    setShowPrevious(false);
                  }}
                >
                  <p className="font-medium">{result.target_role}</p>
                  <p className="text-sm text-muted-foreground">
                    Match Score: {result.match_score}% • {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your current experience level?
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., I've worked in customer service for 3 years, managed social media for small businesses..."
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What skills do you already have?
                </label>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., Communication, problem-solving, basic Excel, organizing events..."
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What tech role are you interested in?
                </label>
                <textarea
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., Product Manager, UX Designer, Data Analyst..."
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Find My Path Match
                  </>
                )}
              </Button>
            </form>

            {analysis && (
              <div className="space-y-6 mt-8 animate-fade-in">
                <div className="card-base p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Target className="w-6 h-6 text-primary" />
                      Your Match Score
                    </h3>
                    <span className="text-3xl font-bold text-primary">{analysis.matchScore}%</span>
                  </div>
                  <Progress value={analysis.matchScore} className="h-3" />
                  <p className="text-muted-foreground mt-4">{analysis.encouragement}</p>
                </div>

                <div className="card-base p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-success" />
                    Your Transferable Skills
                  </h3>
                  <ul className="space-y-3">
                    {analysis.transferableSkills.map((skill, index) => (
                      <li key={index} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-base p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-secondary" />
                    Skills to Develop
                  </h3>
                  <ul className="space-y-3">
                    {analysis.skillGaps.map((gap, index) => (
                      <li key={index} className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-base p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Your Recommended Learning Path
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{analysis.recommendedPath}</p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                      setExperience("");
                      setSkills("");
                      setTargetRole("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Start New Analysis
                  </Button>
                  <Button
                    onClick={() => navigate("/roles")}
                    className="flex-1"
                  >
                    Continue to Learning →
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

export default PathMatch;
