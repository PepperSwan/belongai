import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to Belong<span className="text-gradient">AI</span>
            </h1>
            <p className="text-muted-foreground">
              Hello, {user.user_metadata?.full_name || user.email}! Choose where you'd like to start:
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover-lift transition-all cursor-pointer" onClick={() => navigate("/breaking-barriers")}>
            <CardHeader>
              <div className="text-4xl mb-2">✊</div>
              <CardTitle>Breaking Barriers</CardTitle>
              <CardDescription>
                Get personalized advice for overcoming barriers as someone from an underrepresented background in tech
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-all cursor-pointer" onClick={() => navigate("/path-match")}>
            <CardHeader>
              <Sparkles className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Find Your Path Match</CardTitle>
              <CardDescription>
                Discover how your existing skills and experience translate to tech roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Start Matching
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-all cursor-pointer" onClick={() => navigate("/roles")}>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>
                Explore tech roles through gamified, real-world tasks and build your confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Explore Roles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
