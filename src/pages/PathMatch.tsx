import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, Target, Loader2, ChevronRight, ChevronLeft } from "lucide-react";

interface FormData {
  education: string;
  educationDetails: string;
  industries: string[];
  careerDetails: string;
  skills: string[];
  skillsDetails: string;
  techRoles: string[];
  techRolesDetails: string;
}

interface AnalysisResult {
  matchScore: number;
  transferableSkills: string[];
  skillGaps: string[];
  recommendedPath: string;
  encouragement: string;
}

const EDUCATION_OPTIONS = [
  { value: "gcse", label: "GCSEs or equivalent" },
  { value: "alevels", label: "A-Levels or equivalent" },
  { value: "baccalaureate", label: "Baccalaureate" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "postgrad", label: "Postgraduate/PhD" },
  { value: "other", label: "Other" },
];

const INDUSTRY_OPTIONS = [
  { value: "retail", label: "Retail" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "creative", label: "Creative Arts & Media" },
  { value: "engineering", label: "Engineering & Manufacturing" },
  { value: "customer_service", label: "Customer Service" },
  { value: "public_sector", label: "Public Sector" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "construction", label: "Construction & Trades" },
  { value: "transport", label: "Transport & Logistics" },
];

const SKILLS_OPTIONS = [
  { value: "communication", label: "Communication" },
  { value: "problem_solving", label: "Problem Solving" },
  { value: "project_management", label: "Project Management" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "design", label: "Design & Creativity" },
  { value: "writing", label: "Writing & Content" },
  { value: "customer_service", label: "Customer Service" },
  { value: "leadership", label: "Leadership & Team Management" },
  { value: "research", label: "Research & Analysis" },
  { value: "organization", label: "Organization & Planning" },
  { value: "teaching", label: "Teaching & Training" },
  { value: "sales", label: "Sales & Negotiation" },
];

const TECH_ROLES_OPTIONS = [
  { value: "data_analyst", label: "Data Analyst" },
  { value: "ux_designer", label: "UX/UI Designer" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "product_manager", label: "Product Manager" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "qa_tester", label: "QA Tester" },
  { value: "data_scientist", label: "Data Scientist" },
  { value: "business_analyst", label: "Business Analyst" },
  { value: "technical_writer", label: "Technical Writer" },
  { value: "project_manager", label: "Technical Project Manager" },
  { value: "support_engineer", label: "Technical Support Engineer" },
  { value: "cybersecurity", label: "Cybersecurity Analyst" },
];

const PathMatch = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    education: "",
    educationDetails: "",
    industries: [],
    careerDetails: "",
    skills: [],
    skillsDetails: "",
    techRoles: [],
    techRolesDetails: "",
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.education !== "";
      case 2:
        return formData.industries.length > 0;
      case 3:
        return formData.skills.length > 0;
      case 4:
        return formData.techRoles.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format data for AI analysis
      const educationText = `Education: ${EDUCATION_OPTIONS.find(e => e.value === formData.education)?.label || formData.education}. ${formData.educationDetails}`;
      
      const industriesText = `Career history in industries: ${formData.industries.map(i => INDUSTRY_OPTIONS.find(opt => opt.value === i)?.label).join(", ")}. Details: ${formData.careerDetails}`;
      
      const skillsText = `Skills: ${formData.skills.map(s => SKILLS_OPTIONS.find(opt => opt.value === s)?.label).join(", ")}. Additional skills: ${formData.skillsDetails}`;
      
      const rolesText = `Interested in roles: ${formData.techRoles.map(r => TECH_ROLES_OPTIONS.find(opt => opt.value === r)?.label).join(", ")}. Additional interests: ${formData.techRolesDetails}`;

      const combinedExperience = `${educationText} ${industriesText}`;
      const combinedSkills = skillsText;
      const combinedTargetRole = rolesText;

      const { data, error } = await supabase.functions.invoke("analyze-skills", {
        body: {
          experience: combinedExperience,
          skills: combinedSkills,
          targetRole: combinedTargetRole,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);

      // Save to database
      const { error: saveError } = await supabase
        .from("path_match_results")
        .insert({
          user_id: user?.id,
          experience: combinedExperience,
          skills: combinedSkills,
          target_role: combinedTargetRole,
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
        description: error.message || "Failed to analyze. Please try again.",
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

  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-8">
            ← Back to Dashboard
          </Button>

          <div className="space-y-6 animate-fade-in">
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
                  setCurrentStep(1);
                  setFormData({
                    education: "",
                    educationDetails: "",
                    industries: [],
                    careerDetails: "",
                    skills: [],
                    skillsDetails: "",
                    techRoles: [],
                    techRolesDetails: "",
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Start New Analysis
              </Button>
              <Button onClick={() => navigate("/roles")} className="flex-1">
                Continue to Learning →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Find Your Path Match</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Discover how your background translates to tech roles
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
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
                    setShowPrevious(false);
                  }}
                >
                  <p className="font-medium">Tech Path Analysis</p>
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
            <CardTitle>
              {currentStep === 1 && "What's your education level?"}
              {currentStep === 2 && "What's your career history?"}
              {currentStep === 3 && "What skills do you have?"}
              {currentStep === 4 && "Which tech roles interest you?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.education}
                  onValueChange={(value) => setFormData({ ...formData, education: value })}
                >
                  {EDUCATION_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div>
                  <Label htmlFor="education-details">Additional information (optional)</Label>
                  <Textarea
                    id="education-details"
                    value={formData.educationDetails}
                    onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
                    placeholder="Add any relevant details about your education..."
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select all industries you've worked in:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INDUSTRY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.industries.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("industries", option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="career-details">Tell us about your roles and responsibilities</Label>
                  <Textarea
                    id="career-details"
                    value={formData.careerDetails}
                    onChange={(e) => setFormData({ ...formData, careerDetails: e.target.value })}
                    placeholder="E.g., Managed a team of 5, handled customer complaints, organized events..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select all skills you have:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SKILLS_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.skills.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("skills", option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="skills-details">Additional skills (technical, languages, etc.)</Label>
                  <Textarea
                    id="skills-details"
                    value={formData.skillsDetails}
                    onChange={(e) => setFormData({ ...formData, skillsDetails: e.target.value })}
                    placeholder="E.g., Basic Excel, Spanish fluent, Photoshop, HTML/CSS..."
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select all roles that interest you:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TECH_ROLES_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.techRoles.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("techRoles", option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="roles-details">Any other tech roles you're curious about?</Label>
                  <Textarea
                    id="roles-details"
                    value={formData.techRolesDetails}
                    onChange={(e) => setFormData({ ...formData, techRolesDetails: e.target.value })}
                    placeholder="E.g., Machine Learning Engineer, Cloud Architect, Blockchain Developer..."
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get My Path Match
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PathMatch;
