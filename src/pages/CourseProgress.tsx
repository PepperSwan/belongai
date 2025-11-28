import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, TrendingUp } from "lucide-react";

interface CourseWithProgress {
  id: string;
  role: string;
  difficulty: string;
  title: string;
  description: string;
  questions_answered: number;
  total_questions: number;
  first_attempt_correct: number;
  total_attempts: number;
  completed_at: string | null;
  started_at: string;
  last_accessed: string;
}

const CourseProgress = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      // Fetch user's course progress joined with course info
      const { data, error } = await supabase
        .from("user_course_progress")
        .select(`
          *,
          courses (
            id,
            role,
            difficulty,
            title,
            description
          )
        `)
        .eq("user_id", user!.id)
        .order("last_accessed", { ascending: false });

      if (error) throw error;

      // Flatten the data structure
      const formattedData: CourseWithProgress[] = (data || []).map((item: any) => ({
        id: item.course_id,
        role: item.courses.role,
        difficulty: item.courses.difficulty,
        title: item.courses.title,
        description: item.courses.description,
        questions_answered: item.questions_answered,
        total_questions: item.total_questions,
        first_attempt_correct: item.first_attempt_correct,
        total_attempts: item.total_attempts,
        completed_at: item.completed_at,
        started_at: item.started_at,
        last_accessed: item.last_accessed,
      }));

      setCourses(formattedData);

      // Calculate overall accuracy
      const totalCorrect = formattedData.reduce((sum, c) => sum + c.first_attempt_correct, 0);
      const totalAttempts = formattedData.reduce((sum, c) => sum + c.total_attempts, 0);
      const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      setOverallAccuracy(accuracy);
    } catch (error) {
      console.error("Error fetching progress:", error);
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

  const completedCourses = courses.filter((c) => c.completed_at !== null);
  const inProgressCourses = courses.filter((c) => c.completed_at === null);

  const getCourseAccuracy = (course: CourseWithProgress) => {
    if (course.total_attempts === 0) return 0;
    return (course.first_attempt_correct / course.total_attempts) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "hard":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-muted";
    }
  };

  const getCourseSlug = (course: CourseWithProgress) => {
    return course.title.toLowerCase().replace(/\s+/g, "-");
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Course Progress</h1>
            <p className="text-muted-foreground">
              Track your learning journey and see how you're improving!
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Courses Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Courses Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{completedCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Overall Accuracy
                  <TrendingUp className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(overallAccuracy)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  First attempt correct rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Message */}
          {courses.length === 0 && (
            <Card className="mb-8 border-primary/50">
              <CardContent className="pt-6">
                <p className="text-center text-lg">
                  🚀 Ready to start your learning journey? Head to{" "}
                  <Link to="/roles" className="text-primary hover:underline">
                    Explore Roles
                  </Link>{" "}
                  to choose your first course!
                </p>
              </CardContent>
            </Card>
          )}

          {courses.length > 0 && completedCourses.length === 0 && (
            <Card className="mb-8 border-primary/50">
              <CardContent className="pt-6">
                <p className="text-center text-lg">
                  💪 Great start! Keep going to complete your first course and earn your first trophy!
                </p>
              </CardContent>
            </Card>
          )}

          {completedCourses.length > 0 && (
            <Card className="mb-8 border-green-500/50">
              <CardContent className="pt-6">
                <p className="text-center text-lg">
                  🎉 Amazing! You've completed {completedCourses.length} course{completedCourses.length > 1 ? "s" : ""}!
                  Keep up the excellent work!
                </p>
              </CardContent>
            </Card>
          )}

          {/* In Progress Courses */}
          {inProgressCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">In Progress</h2>
              <div className="grid gap-4">
                {inProgressCourses.map((course) => {
                  const progressPercent = (course.questions_answered / course.total_questions) * 100;
                  const accuracy = getCourseAccuracy(course);

                  return (
                    <Card
                      key={course.id}
                      className="hover-lift cursor-pointer transition-all"
                      onClick={() => navigate(`/learn/${getCourseSlug(course)}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle>{course.title}</CardTitle>
                              <Badge className={getDifficultyColor(course.difficulty)}>
                                {course.difficulty}
                              </Badge>
                            </div>
                            <CardDescription>{course.role}</CardDescription>
                          </div>
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {course.questions_answered} / {course.total_questions} questions
                            </span>
                          </div>
                          <Progress value={progressPercent} />
                        </div>
                        {course.total_attempts > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-medium">{Math.round(accuracy)}%</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Courses */}
          {completedCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Completed</h2>
              <div className="grid gap-4">
                {completedCourses.map((course) => {
                  const accuracy = getCourseAccuracy(course);

                  return (
                    <Card key={course.id} className="border-green-500/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="flex items-center gap-2">
                                {course.title}
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              </CardTitle>
                              <Badge className={getDifficultyColor(course.difficulty)}>
                                {course.difficulty}
                              </Badge>
                            </div>
                            <CardDescription>{course.role}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completed</span>
                          <span className="font-medium">
                            {new Date(course.completed_at!).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Final Accuracy</span>
                          <span className="font-medium text-green-500">{Math.round(accuracy)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseProgress;
