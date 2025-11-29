import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Shield, Lightbulb, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdviceResult {
  barriers: string[];
  strategies: string[];
  resources: string[];
  encouragement: string;
}

const BreakingBarriers = () => {
  const [age, setAge] = useState<number[]>([25]);
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState<string[]>([]);
  const [sexuality, setSexuality] = useState("");
  const [disabilityStatus, setDisabilityStatus] = useState("");
  const [disabilityDetails, setDisabilityDetails] = useState("");
  const [neurodiversityStatus, setNeurodiversityStatus] = useState("");
  const [neurodiversityDetails, setNeurodiversityDetails] = useState("");
  const [parentOccupation, setParentOccupation] = useState("");
  const [childHobbies, setChildHobbies] = useState<string[]>([]);
  const [householdIncome, setHouseholdIncome] = useState<number[]>([50000]);
  const [familyUniversity, setFamilyUniversity] = useState<string>("");
  const [locationGrewUp, setLocationGrewUp] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
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

  const buildBackgroundText = () => {
    const parts = [];
    
    if (age[0]) parts.push(`Age: ${age[0]}`);
    if (gender) parts.push(`Gender: ${gender}`);
    if (ethnicity.length > 0) parts.push(`Ethnicity: ${ethnicity.join(", ")}`);
    if (sexuality) parts.push(`Sexuality: ${sexuality}`);
    if (disabilityStatus === "yes" && disabilityDetails) parts.push(`Disability: ${disabilityDetails}`);
    if (neurodiversityStatus === "yes" && neurodiversityDetails) parts.push(`Neurodiversity: ${neurodiversityDetails}`);
    if (parentOccupation) parts.push(`Parent's occupation at age 14: ${parentOccupation}`);
    if (childHobbies.length > 0) parts.push(`Childhood hobbies: ${childHobbies.join(", ")}`);
    if (householdIncome[0]) parts.push(`Household income at age 14: £${householdIncome[0].toLocaleString()}`);
    if (familyUniversity) parts.push(`Family university history: ${familyUniversity}`);
    if (locationGrewUp) parts.push(`Grew up in: ${locationGrewUp}`);
    if (additionalInfo) parts.push(`Additional information: ${additionalInfo}`);
    
    return parts.join(". ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const backgroundText = buildBackgroundText();
    
    if (!backgroundText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please answer at least one question about yourself.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("breaking-barriers-advice", {
        body: {
          background: backgroundText,
        },
      });

      if (error) throw error;

      setAdvice(data.advice);

      // Save to database
      const { error: saveError } = await supabase.from("breaking_barriers_results").insert({
        user_id: user?.id,
        background_category: "Structured Questionnaire",
        experience: backgroundText,
        barriers: data.advice.barriers,
        strategies: data.advice.strategies,
        resources: data.advice.resources,
        encouragement: data.advice.encouragement,
        age_range: age[0] ? `${age[0]} years` : null,
        gender: gender || null,
        ethnicity: ethnicity.length > 0 ? ethnicity : null,
        sexuality: sexuality || null,
        disability_status: disabilityStatus || null,
        disability_details: disabilityDetails || null,
        neurodiversity_status: neurodiversityStatus || null,
        neurodiversity_details: neurodiversityDetails || null,
        parent_occupation_age14: parentOccupation || null,
        childhood_hobbies: childHobbies.length > 0 ? childHobbies : null,
        household_income_age14: householdIncome[0] ? `£${householdIncome[0].toLocaleString()}` : null,
        family_university: familyUniversity === "yes",
        location_grew_up: locationGrewUp || null,
        additional_info: additionalInfo || null,
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

  const toggleEthnicity = (value: string) => {
    setEthnicity(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleHobby = (value: string) => {
    setChildHobbies(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your unique background and experiences. Our AI will provide personalized advice for overcoming
            barriers in tech, tailored specifically to your situation.
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
                    setShowPrevious(false);
                  }}
                >
                  <p className="font-medium">{result.background_category}</p>
                  <p className="text-sm text-muted-foreground">{new Date(result.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Get Personalized Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              All questions are <strong>optional</strong>. Share only what you're comfortable with. This information remains completely private and is used only to provide personalized advice.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Age */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Your Age</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={age}
                    onValueChange={setAge}
                    min={16}
                    max={80}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold w-12 text-right">{age[0]}</span>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Your Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="woman" id="woman" />
                    <Label htmlFor="woman" className="font-normal">Woman</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="man" id="man" />
                    <Label htmlFor="man" className="font-normal">Man</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary" className="font-normal">Non-binary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say-gender" id="prefer-not-to-say-gender" />
                    <Label htmlFor="prefer-not-to-say-gender" className="font-normal">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Ethnicity */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Your Ethnicity (select all that apply)</Label>
                <div className="space-y-2">
                  {["White", "Black/African/Caribbean", "Asian", "Mixed/Multiple", "Hispanic/Latino", "Middle Eastern", "Pacific Islander", "Indigenous", "Other"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`ethnicity-${option}`}
                        checked={ethnicity.includes(option)}
                        onCheckedChange={() => toggleEthnicity(option)}
                      />
                      <Label htmlFor={`ethnicity-${option}`} className="font-normal">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sexuality */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Your Sexuality</Label>
                <RadioGroup value={sexuality} onValueChange={setSexuality}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heterosexual" id="heterosexual" />
                    <Label htmlFor="heterosexual" className="font-normal">Heterosexual/Straight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gay" id="gay" />
                    <Label htmlFor="gay" className="font-normal">Gay/Lesbian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bisexual" id="bisexual" />
                    <Label htmlFor="bisexual" className="font-normal">Bisexual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pansexual" id="pansexual" />
                    <Label htmlFor="pansexual" className="font-normal">Pansexual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asexual" id="asexual" />
                    <Label htmlFor="asexual" className="font-normal">Asexual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="queer" id="queer" />
                    <Label htmlFor="queer" className="font-normal">Queer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say-sexuality" id="prefer-not-to-say-sexuality" />
                    <Label htmlFor="prefer-not-to-say-sexuality" className="font-normal">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Disability */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you consider yourself to be disabled?</Label>
                <RadioGroup value={disabilityStatus} onValueChange={setDisabilityStatus}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disability-yes" />
                    <Label htmlFor="disability-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disability-no" />
                    <Label htmlFor="disability-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say-disability" id="prefer-not-to-say-disability" />
                    <Label htmlFor="prefer-not-to-say-disability" className="font-normal">Prefer not to say</Label>
                  </div>
                </RadioGroup>
                {disabilityStatus === "yes" && (
                  <input
                    type="text"
                    value={disabilityDetails}
                    onChange={(e) => setDisabilityDetails(e.target.value)}
                    placeholder="If you'd like, please specify (e.g., mobility, visual, hearing, chronic illness)"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                )}
              </div>

              {/* Neurodiversity */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you consider yourself to be neurodiverse?</Label>
                <RadioGroup value={neurodiversityStatus} onValueChange={setNeurodiversityStatus}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="neuro-yes" />
                    <Label htmlFor="neuro-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="neuro-no" />
                    <Label htmlFor="neuro-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say-neuro" id="prefer-not-to-say-neuro" />
                    <Label htmlFor="prefer-not-to-say-neuro" className="font-normal">Prefer not to say</Label>
                  </div>
                </RadioGroup>
                {neurodiversityStatus === "yes" && (
                  <input
                    type="text"
                    value={neurodiversityDetails}
                    onChange={(e) => setNeurodiversityDetails(e.target.value)}
                    placeholder="If you'd like, please specify (e.g., ADHD, autism, dyslexia)"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                )}
              </div>

              {/* Socioeconomic Background Section */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Background Information</h3>
                
                {/* Parent Occupation */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium">What was your parent/guardian's occupation when you were 14?</Label>
                  <select
                    value={parentOccupation}
                    onChange={(e) => setParentOccupation(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="">Select an option</option>
                    <option value="professional">Professional (doctor, lawyer, engineer, teacher)</option>
                    <option value="manager">Manager/Senior official</option>
                    <option value="skilled">Skilled trade (electrician, plumber, chef)</option>
                    <option value="administrative">Administrative/Clerical</option>
                    <option value="service">Service/Care (retail, hospitality, care work)</option>
                    <option value="manual">Manual/Elementary occupation</option>
                    <option value="self-employed">Self-employed/Small business owner</option>
                    <option value="unemployed">Unemployed/Not working</option>
                    <option value="retired">Retired</option>
                    <option value="other-occupation">Other</option>
                  </select>
                </div>

                {/* Childhood Hobbies */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium">What were your favourite hobbies when younger? (select all that apply)</Label>
                  <div className="space-y-2">
                    {["Sports/Athletics", "Reading/Literature", "Arts/Crafts", "Music/Performing Arts", "Gaming/Technology", "Outdoor activities", "Science/Experiments", "Volunteering/Community service"].map(hobby => (
                      <div key={hobby} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`hobby-${hobby}`}
                          checked={childHobbies.includes(hobby)}
                          onCheckedChange={() => toggleHobby(hobby)}
                        />
                        <Label htmlFor={`hobby-${hobby}`} className="font-normal">{hobby}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Household Income */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium">Approximate household income when you were 14</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={householdIncome}
                      onValueChange={setHouseholdIncome}
                      min={10000}
                      max={150000}
                      step={5000}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold w-24 text-right">£{householdIncome[0].toLocaleString()}</span>
                  </div>
                </div>

                {/* Family University */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium">Has anyone in your immediate family been to university?</Label>
                  <RadioGroup value={familyUniversity} onValueChange={setFamilyUniversity}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="uni-yes" />
                      <Label htmlFor="uni-yes" className="font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="uni-no" />
                      <Label htmlFor="uni-no" className="font-normal">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unsure" id="uni-unsure" />
                      <Label htmlFor="uni-unsure" className="font-normal">Not sure</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Location */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium">Where did you grow up?</Label>
                  <input
                    type="text"
                    value={locationGrewUp}
                    onChange={(e) => setLocationGrewUp(e.target.value)}
                    placeholder="e.g., London, rural Scotland, Manchester"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Anything else you'd like to share?</Label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full min-h-[100px] px-4 py-3 rounded-md border border-input bg-background"
                  placeholder="Any additional background or context you'd like to provide..."
                  disabled={isLoading}
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
                      setAge([25]);
                      setGender("");
                      setEthnicity([]);
                      setSexuality("");
                      setDisabilityStatus("");
                      setDisabilityDetails("");
                      setNeurodiversityStatus("");
                      setNeurodiversityDetails("");
                      setParentOccupation("");
                      setChildHobbies([]);
                      setHouseholdIncome([50000]);
                      setFamilyUniversity("");
                      setLocationGrewUp("");
                      setAdditionalInfo("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Start New Assessment
                  </Button>
                  <Button onClick={() => navigate("/path-match")} className="flex-1">
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
