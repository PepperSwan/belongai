import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, Loader2, Trophy } from "lucide-react";

interface StreakData {
  current_streak: number;
  max_streak: number;
  last_activity_date: string | null;
}

const Streak = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak(data);
      } else {
        // Initialize streak for new user
        const { data: newStreak, error: insertError } = await supabase
          .from("user_streaks")
          .insert([
            {
              user_id: user!.id,
              current_streak: 0,
              max_streak: 0,
              last_activity_date: null,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        setStreak(newStreak);
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
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

  const currentStreak = streak?.current_streak || 0;
  const maxStreak = streak?.max_streak || 0;
  const lastActivity = streak?.last_activity_date
    ? new Date(streak.last_activity_date)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isActiveToday = lastActivity
    ? lastActivity.toDateString() === today.toDateString()
    : false;

  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "🚀 Start your streak today by completing a course!";
    }
    if (currentStreak === 1) {
      return "🎉 Great start! Come back tomorrow to build your streak!";
    }
    if (currentStreak < 7) {
      return `💪 ${currentStreak} days strong! Keep the momentum going!`;
    }
    if (currentStreak < 30) {
      return `🔥 ${currentStreak} day streak! You're on fire!`;
    }
    return `⚡ ${currentStreak} days! You're absolutely unstoppable!`;
  };

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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Your Learning Streak</h1>
            <p className="text-muted-foreground">
              Complete a course every day to maintain your streak!
            </p>
          </div>

          {/* Current Streak Display */}
          <Card className="mb-8 border-primary/50">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <Flame className="w-24 h-24 text-orange-500 animate-pulse" />
              </div>
              <div className="text-7xl font-bold mb-4 text-gradient">
                {currentStreak}
              </div>
              <p className="text-2xl text-muted-foreground mb-6">
                {currentStreak === 1 ? "day" : "days"} streak
              </p>
              <div className="text-lg">
                {isActiveToday ? (
                  <span className="text-green-500 font-medium">
                    ✓ You've completed a course today!
                  </span>
                ) : (
                  <span className="text-orange-500 font-medium">
                    Complete a course today to continue your streak!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <CardTitle>Personal Best</CardTitle>
                    <CardDescription>Your longest streak ever</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{maxStreak}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {maxStreak === 1 ? "day" : "days"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <CardTitle>Today's Status</CardTitle>
                    <CardDescription>Your progress for today</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isActiveToday ? (
                  <div>
                    <div className="text-2xl font-bold text-green-500 mb-2">
                      Complete! ✓
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Come back tomorrow to keep it going!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-orange-500 mb-2">
                      Not Yet
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete a course to maintain your streak!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Motivational Message */}
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <p className="text-center text-xl mb-4">{getMotivationalMessage()}</p>
              {currentStreak > 0 && currentStreak === maxStreak && maxStreak > 1 && (
                <p className="text-center text-green-500 font-medium">
                  🎊 You're at your personal best! Can you beat it?
                </p>
              )}
              {!isActiveToday && (
                <div className="text-center mt-6">
                  <Link to="/roles">
                    <Button size="lg">
                      <Flame className="mr-2 h-5 w-5" />
                      Continue Your Streak
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Milestones */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Streak Milestones</CardTitle>
              <CardDescription>Keep going to unlock these achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-3 ${currentStreak >= 7 ? "opacity-100" : "opacity-50"}`}>
                <div className="text-3xl">🔥</div>
                <div className="flex-1">
                  <div className="font-medium">On Fire</div>
                  <div className="text-sm text-muted-foreground">7 day streak</div>
                </div>
                {currentStreak >= 7 && <span className="text-green-500">✓</span>}
              </div>
              <div className={`flex items-center gap-3 ${currentStreak >= 30 ? "opacity-100" : "opacity-50"}`}>
                <div className="text-3xl">⚡</div>
                <div className="flex-1">
                  <div className="font-medium">Unstoppable</div>
                  <div className="text-sm text-muted-foreground">30 day streak</div>
                </div>
                {currentStreak >= 30 && <span className="text-green-500">✓</span>}
              </div>
              <div className={`flex items-center gap-3 ${currentStreak >= 100 ? "opacity-100" : "opacity-50"}`}>
                <div className="text-3xl">👑</div>
                <div className="flex-1">
                  <div className="font-medium">Legend</div>
                  <div className="text-sm text-muted-foreground">100 day streak</div>
                </div>
                {currentStreak >= 100 && <span className="text-green-500">✓</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Streak;
