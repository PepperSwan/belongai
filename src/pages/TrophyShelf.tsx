import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: any;
}

interface UserTrophy {
  trophy_id: string;
  earned_at: string;
}

const TrophyShelf = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [allTrophies, setAllTrophies] = useState<Trophy[]>([]);
  const [earnedTrophies, setEarnedTrophies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTrophies();
    }
  }, [user]);

  const fetchTrophies = async () => {
    try {
      // Fetch all trophies
      const { data: trophiesData, error: trophiesError } = await supabase
        .from("trophies")
        .select("*")
        .order("name", { ascending: true });

      if (trophiesError) throw trophiesError;
      setAllTrophies(trophiesData || []);

      // Fetch user's earned trophies
      const { data: userTrophiesData, error: userTrophiesError } = await supabase
        .from("user_trophies")
        .select("trophy_id, earned_at")
        .eq("user_id", user!.id);

      if (userTrophiesError) throw userTrophiesError;

      const earnedIds = new Set((userTrophiesData || []).map((ut: UserTrophy) => ut.trophy_id));
      setEarnedTrophies(earnedIds);
    } catch (error) {
      console.error("Error fetching trophies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const earned = allTrophies.filter((t) => earnedTrophies.has(t.id));
  const locked = allTrophies.filter((t) => !earnedTrophies.has(t.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Trophy Shelf</h1>
            <p className="text-muted-foreground">
              Collect trophies by completing courses and achieving milestones!
            </p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary">
                {earned.length} / {allTrophies.length}
              </span>
              <span className="text-muted-foreground ml-2">trophies earned</span>
            </div>
          </div>

          {/* Earned Trophies */}
          {earned.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Earned Trophies 🎉</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {earned.map((trophy) => (
                  <TooltipProvider key={trophy.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="hover-lift transition-all border-primary/50 cursor-pointer">
                          <CardHeader className="text-center">
                            <div className="text-6xl mb-2 animate-bounce-subtle">
                              {trophy.icon}
                            </div>
                            <CardTitle>{trophy.name}</CardTitle>
                            <CardDescription>{trophy.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Earned! 🎊</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Locked Trophies */}
          {locked.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Locked Trophies 🔒</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {locked.map((trophy) => (
                  <TooltipProvider key={trophy.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="opacity-50 hover:opacity-70 transition-all cursor-pointer">
                          <CardHeader className="text-center relative">
                            <div className="absolute top-4 right-4">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-6xl mb-2 grayscale">{trophy.icon}</div>
                            <CardTitle>{trophy.name}</CardTitle>
                            <CardDescription>{trophy.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">How to earn:</p>
                        <p>{trophy.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Message */}
          {earned.length === 0 && (
            <Card className="border-primary/50">
              <CardContent className="pt-6 text-center">
                <p className="text-lg mb-4">
                  🏆 Start your journey to earn your first trophy!
                </p>
                <Link to="/roles">
                  <Button>Explore Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrophyShelf;
