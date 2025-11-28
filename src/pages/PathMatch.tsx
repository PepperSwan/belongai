import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, CheckCircle, AlertCircle, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  transferableSkills: string[];
  skillGaps: string[];
  recommendedPath: string;
  matchScore: number;
  encouragement: string;
}

const PathMatch = () => {
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!experience.trim() || !skills.trim() || !targetRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to get your path match analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-skills', {
        body: { experience, skills, targetRole }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete!",
        description: "Your personalized path match is ready.",
      });
    } catch (error) {
      console.error('Error analyzing skills:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your skills. Please try again.",
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

          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your current experience level?
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="E.g., I've worked in customer service for 3 years, managed social media for small businesses..."
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleAnalyze}
                disabled={loading}
              >
                <Sparkles className="mr-2 w-5 h-5" />
                {loading ? "Analyzing..." : "Find My Path Match"}
              </Button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Match Score */}
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

              {/* Transferable Skills */}
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

              {/* Skill Gaps */}
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

              {/* Recommended Path */}
              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Your Recommended Learning Path
                </h3>
                <p className="text-muted-foreground leading-relaxed">{analysis.recommendedPath}</p>
                <Link to="/roles" className="block mt-6">
                  <Button className="w-full">
                    Start Learning
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

export default PathMatch;
