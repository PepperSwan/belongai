import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Users, UserPlus, Copy, Trash2, Trophy, Flame, BookOpen, Loader2 } from "lucide-react";

interface Friend {
  id: string;
  full_name: string | null;
  email: string;
  friend_code: string;
}

interface FriendStats {
  friend: Friend;
  coursesCompleted: number;
  trophiesEarned: number;
  currentStreak: number;
  maxStreak: number;
  recentActivity: string[];
}

const Friends = () => {
  const [friendCode, setFriendCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [friends, setFriends] = useState<FriendStats[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadFriendCode();
      loadFriends();
      loadSuggestedFriends();
    }
  }, [user]);

  const loadFriendCode = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("friend_code")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setFriendCode(data.friend_code || "");
    } catch (error: any) {
      console.error("Error loading friend code:", error);
    }
  };

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      // Get friendships
      const { data: friendships, error: friendError } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user?.id);

      if (friendError) throw friendError;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setIsLoading(false);
        return;
      }

      const friendIds = friendships.map((f) => f.friend_id);

      // Get friend profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, friend_code")
        .in("id", friendIds);

      if (profileError) throw profileError;

      // Get stats for each friend
      const friendStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get course completions
          const { data: courses } = await supabase
            .from("user_course_progress")
            .select("completed_at")
            .eq("user_id", profile.id)
            .not("completed_at", "is", null);

          // Get trophies
          const { data: trophies } = await supabase
            .from("user_trophies")
            .select("earned_at")
            .eq("user_id", profile.id);

          // Get streak
          const { data: streak } = await supabase
            .from("user_streaks")
            .select("current_streak, max_streak")
            .eq("user_id", profile.id)
            .single();

          // Get recent activity
          const { data: recentCourses } = await supabase
            .from("user_course_progress")
            .select("completed_at, course_id, courses(title)")
            .eq("user_id", profile.id)
            .not("completed_at", "is", null)
            .order("completed_at", { ascending: false })
            .limit(3);

          const recentActivity = recentCourses?.map((c: any) => 
            `Completed ${c.courses?.title || 'a course'}`
          ) || [];

          return {
            friend: profile,
            coursesCompleted: courses?.length || 0,
            trophiesEarned: trophies?.length || 0,
            currentStreak: streak?.current_streak || 0,
            maxStreak: streak?.max_streak || 0,
            recentActivity,
          };
        })
      );

      setFriends(friendStats);
    } catch (error: any) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestedFriends = async () => {
    try {
      // Get users who are learning similar roles
      const { data: myProgress } = await supabase
        .from("learning_progress")
        .select("role")
        .eq("user_id", user?.id);

      if (!myProgress || myProgress.length === 0) return;

      const myRoles = myProgress.map((p) => p.role);

      const { data: suggestions } = await supabase
        .from("learning_progress")
        .select("user_id, profiles(id, full_name, email, friend_code)")
        .in("role", myRoles)
        .neq("user_id", user?.id);

      if (!suggestions) return;

      // Get current friend IDs to filter out
      const { data: existingFriends } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user?.id);

      const friendIds = existingFriends?.map((f) => f.friend_id) || [];

      const uniqueSuggestions = suggestions
        .filter((s: any) => !friendIds.includes(s.user_id))
        .map((s: any) => s.profiles)
        .filter((p: any, index: number, self: any[]) => 
          p && self.findIndex((t: any) => t?.id === p.id) === index
        )
        .slice(0, 5);

      setSuggestedFriends(uniqueSuggestions);
    } catch (error: any) {
      console.error("Error loading suggestions:", error);
    }
  };

  const copyFriendCode = () => {
    navigator.clipboard.writeText(friendCode);
    toast.success("Friend code copied to clipboard!");
  };

  const addFriend = async (code: string) => {
    if (!code.trim()) {
      toast.error("Please enter a friend code");
      return;
    }

    setIsAdding(true);
    try {
      // Find user by friend code
      const { data: friendProfile, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("friend_code", code.toUpperCase())
        .single();

      if (findError || !friendProfile) {
        toast.error("Friend code not found");
        return;
      }

      if (friendProfile.id === user?.id) {
        toast.error("You can't add yourself as a friend!");
        return;
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .eq("user_id", user?.id)
        .eq("friend_id", friendProfile.id)
        .single();

      if (existing) {
        toast.error("Already friends with this user");
        return;
      }

      // Add friendship (both directions)
      const { error: addError1 } = await supabase
        .from("friendships")
        .insert({ user_id: user?.id, friend_id: friendProfile.id });

      const { error: addError2 } = await supabase
        .from("friendships")
        .insert({ user_id: friendProfile.id, friend_id: user?.id });

      if (addError1 || addError2) throw addError1 || addError2;

      toast.success("Friend added successfully!");
      setInputCode("");
      loadFriends();
      loadSuggestedFriends();
    } catch (error: any) {
      console.error("Error adding friend:", error);
      toast.error("Failed to add friend");
    } finally {
      setIsAdding(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      // Remove both directions
      await supabase
        .from("friendships")
        .delete()
        .eq("user_id", user?.id)
        .eq("friend_id", friendId);

      await supabase
        .from("friendships")
        .delete()
        .eq("user_id", friendId)
        .eq("friend_id", user?.id);

      toast.success("Friend removed");
      loadFriends();
      loadSuggestedFriends();
    } catch (error: any) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-8">
          ← Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Friends</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Connect with others on their tech journey
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Your Friend Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={friendCode}
                readOnly
                className="text-2xl font-mono text-center tracking-wider"
              />
              <Button onClick={copyFriendCode} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Share this code with friends so they can add you!
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="my-friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-friends">My Friends</TabsTrigger>
            <TabsTrigger value="add-friend">Add Friend</TabsTrigger>
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
          </TabsList>

          <TabsContent value="my-friends">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : friends.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No friends yet. Add some friends to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {friends.map(({ friend, coursesCompleted, trophiesEarned, currentStreak, maxStreak, recentActivity }) => (
                  <Card key={friend.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {friend.full_name?.[0] || friend.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {friend.full_name || friend.email.split('@')[0]}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-mono">
                              {friend.friend_code}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFriend(friend.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                            <BookOpen className="w-5 h-5" />
                            {coursesCompleted}
                          </div>
                          <p className="text-xs text-muted-foreground">Courses</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-secondary">
                            <Trophy className="w-5 h-5" />
                            {trophiesEarned}
                          </div>
                          <p className="text-xs text-muted-foreground">Trophies</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent">
                            <Flame className="w-5 h-5" />
                            {currentStreak}
                          </div>
                          <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                      </div>

                      {maxStreak > 0 && (
                        <div className="text-center">
                          <Badge variant="secondary">
                            🏆 Max Streak: {maxStreak} days
                          </Badge>
                        </div>
                      )}

                      {recentActivity.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                          <p className="text-sm font-medium">Recent Activity</p>
                          {recentActivity.map((activity, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              • {activity}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-friend">
            <Card>
              <CardHeader>
                <CardTitle>Add Friend by Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter friend code (e.g., ABC123)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-lg font-mono tracking-wider"
                  />
                  <Button onClick={() => addFriend(inputCode)} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ask your friend for their friend code and enter it here to connect!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggested">
            {suggestedFriends.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No suggestions yet. Start taking courses to find others with similar interests!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suggestedFriends.map((suggested) => (
                  <Card key={suggested.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {suggested.full_name?.[0] || suggested.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {suggested.full_name || suggested.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Learning similar roles
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => addFriend(suggested.friend_code)}
                        className="w-full"
                        variant="outline"
                        disabled={isAdding}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
