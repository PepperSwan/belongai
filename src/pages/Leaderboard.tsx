import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, BookOpen, TrendingUp, Loader2, Medal } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  email: string;
  friend_code: string;
  value: number;
  rank: number;
  isCurrentUser: boolean;
}

const Leaderboard = () => {
  const [streakLeaders, setStreakLeaders] = useState<LeaderboardEntry[]>([]);
  const [trophyLeaders, setTrophyLeaders] = useState<LeaderboardEntry[]>([]);
  const [courseLeaders, setCourseLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalTrophies: 0,
    totalStreak: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadLeaderboards();
      loadCommunityStats();
      checkTopOfClassTrophy();
    }
  }, [user]);

  const loadCommunityStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total completed courses
      const { data: courseData } = await supabase
        .from("user_course_progress")
        .select("id")
        .not("completed_at", "is", null);

      // Get total trophies earned
      const { data: trophyData } = await supabase
        .from("user_trophies")
        .select("id");

      // Get total active streak days (sum of all current streaks)
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak");

      const totalStreak = streakData?.reduce((sum, s) => sum + (s.current_streak || 0), 0) || 0;

      setCommunityStats({
        totalUsers: userCount || 0,
        totalCourses: courseData?.length || 0,
        totalTrophies: trophyData?.length || 0,
        totalStreak,
      });
    } catch (error: any) {
      console.error("Error loading community stats:", error);
    }
  };

  const loadLeaderboards = async () => {
    setIsLoading(true);
    try {
      // Load streak leaderboard
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("user_id, max_streak, profiles(id, full_name, email, friend_code)")
        .order("max_streak", { ascending: false })
        .limit(50);

      if (streaks) {
        const streakLeaderboard = streaks
          .map((s: any, index: number) => ({
            id: s.profiles.id,
            full_name: s.profiles.full_name,
            email: s.profiles.email,
            friend_code: s.profiles.friend_code,
            value: s.max_streak,
            rank: index + 1,
            isCurrentUser: s.profiles.id === user?.id,
          }))
          .filter((entry) => entry.value > 0);

        setStreakLeaders(streakLeaderboard);
      }

      // Load trophy leaderboard
      const { data: trophies } = await supabase
        .from("user_trophies")
        .select("user_id, profiles(id, full_name, email, friend_code)");

      if (trophies) {
        const trophyCount = trophies.reduce((acc: any, t: any) => {
          const userId = t.profiles.id;
          acc[userId] = {
            count: (acc[userId]?.count || 0) + 1,
            profile: t.profiles,
          };
          return acc;
        }, {});

        const trophyLeaderboard = Object.entries(trophyCount)
          .map(([userId, data]: [string, any]) => ({
            id: data.profile.id,
            full_name: data.profile.full_name,
            email: data.profile.email,
            friend_code: data.profile.friend_code,
            value: data.count,
            rank: 0,
            isCurrentUser: userId === user?.id,
          }))
          .sort((a, b) => b.value - a.value)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
          .slice(0, 50);

        setTrophyLeaders(trophyLeaderboard);
      }

      // Load course completion leaderboard
      const { data: courses } = await supabase
        .from("user_course_progress")
        .select("user_id, profiles(id, full_name, email, friend_code)")
        .not("completed_at", "is", null);

      if (courses) {
        const courseCount = courses.reduce((acc: any, c: any) => {
          const userId = c.profiles.id;
          acc[userId] = {
            count: (acc[userId]?.count || 0) + 1,
            profile: c.profiles,
          };
          return acc;
        }, {});

        const courseLeaderboard = Object.entries(courseCount)
          .map(([userId, data]: [string, any]) => ({
            id: data.profile.id,
            full_name: data.profile.full_name,
            email: data.profile.email,
            friend_code: data.profile.friend_code,
            value: data.count,
            rank: 0,
            isCurrentUser: userId === user?.id,
          }))
          .sort((a, b) => b.value - a.value)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
          .slice(0, 50);

        setCourseLeaders(courseLeaderboard);
      }
    } catch (error: any) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTopOfClassTrophy = async () => {
    if (!user) return;

    try {
      // Get user's friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user.id);

      if (!friendships || friendships.length === 0) return;

      const friendIds = friendships.map(f => f.friend_id);
      const allUserIds = [...friendIds, user.id];

      // Get trophy counts for user and friends
      const { data: trophies } = await supabase
        .from("user_trophies")
        .select("user_id")
        .in("user_id", allUserIds);

      if (!trophies) return;

      const trophyCount = trophies.reduce((acc: any, t: any) => {
        acc[t.user_id] = (acc[t.user_id] || 0) + 1;
        return acc;
      }, {});

      const userTrophyCount = trophyCount[user.id] || 0;
      const isTopOfClass = Object.entries(trophyCount).every(
        ([userId, count]: [string, any]) => 
          userId === user.id || count < userTrophyCount
      );

      if (isTopOfClass && userTrophyCount > 0) {
        await awardTrophyByName("Top of the Class");
      }
    } catch (error) {
      console.error("Error checking Top of the Class trophy:", error);
    }
  };

  const awardTrophyByName = async (trophyName: string) => {
    if (!user) return;

    try {
      const { data: trophy } = await supabase
        .from("trophies")
        .select("id")
        .eq("name", trophyName)
        .single();

      if (!trophy) return;

      const { data: existing } = await supabase
        .from("user_trophies")
        .select("id")
        .eq("user_id", user.id)
        .eq("trophy_id", trophy.id)
        .maybeSingle();

      if (existing) return;

      await supabase
        .from("user_trophies")
        .insert({ user_id: user.id, trophy_id: trophy.id });
    } catch (error) {
      console.error("Error awarding trophy:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="text-muted-foreground font-medium">#{rank}</span>;
  };

  const renderLeaderboardTable = (leaders: LeaderboardEntry[], icon: React.ReactNode, label: string) => (
    <div className="space-y-2">
      {leaders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No data yet. Be the first!</p>
          </CardContent>
        </Card>
      ) : (
        leaders.map((leader) => (
          <Card
            key={leader.id}
            className={leader.isCurrentUser ? "border-primary bg-primary/5" : ""}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 flex justify-center">
                  {getRankIcon(leader.rank)}
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {leader.full_name?.[0] || leader.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {leader.full_name || leader.email.split('@')[0]}
                    {leader.isCurrentUser && (
                      <Badge variant="secondary" className="ml-2">You</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {leader.friend_code}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xl font-bold">
                  {icon}
                  <span className="text-primary">{leader.value}</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    {label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-8">
          ← Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Celebrating our community's achievements!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {communityStats.totalUsers}
              </div>
              <p className="text-sm text-muted-foreground">Learners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-1">
                {communityStats.totalCourses}
              </div>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-accent mb-1">
                {communityStats.totalTrophies}
              </div>
              <p className="text-sm text-muted-foreground">Trophies Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {communityStats.totalStreak}
              </div>
              <p className="text-sm text-muted-foreground">Active Streak Days</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="streaks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="streaks">
                <Flame className="w-4 h-4 mr-2" />
                Streaks
              </TabsTrigger>
              <TabsTrigger value="trophies">
                <Trophy className="w-4 h-4 mr-2" />
                Trophies
              </TabsTrigger>
              <TabsTrigger value="courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streaks">
              {renderLeaderboardTable(
                streakLeaders,
                <Flame className="w-5 h-5 text-accent" />,
                "days"
              )}
            </TabsContent>

            <TabsContent value="trophies">
              {renderLeaderboardTable(
                trophyLeaders,
                <Trophy className="w-5 h-5 text-secondary" />,
                "trophies"
              )}
            </TabsContent>

            <TabsContent value="courses">
              {renderLeaderboardTable(
                courseLeaders,
                <BookOpen className="w-5 h-5 text-primary" />,
                "courses"
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
