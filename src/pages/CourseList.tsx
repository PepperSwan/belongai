import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, Gamepad2 } from "lucide-react";

interface Course {
  id: string;
  role: string;
  difficulty: string;
  title: string;
  description: string;
  order_index: number;
  total_questions: number;
}

interface CourseProgress {
  course_id: string;
  questions_answered: number;
  total_questions: number;
  completed_at: string | null;
}

const CourseList = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && role) {
      fetchCoursesAndProgress();
    }
  }, [user, role]);

  const fetchCoursesAndProgress = async () => {
    try {
      // Fetch courses for this role
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("role", role)
        .order("order_index", { ascending: true });

      if (coursesError) throw coursesError;

      setCourses(coursesData || []);

      // Fetch user's progress for these courses
      if (coursesData) {
        const courseIds = coursesData.map((c) => c.id);
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("user_id", user!.id)
          .in("course_id", courseIds);

        if (progressError) throw progressError;

        // Convert to map for easy lookup
        const progressMap: Record<string, CourseProgress> = {};
        (progressData || []).forEach((p) => {
          progressMap[p.course_id] = p;
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
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

  const groupedCourses = {
    easy: courses.filter((c) => c.difficulty === "easy"),
    medium: courses.filter((c) => c.difficulty === "medium"),
    hard: courses.filter((c) => c.difficulty === "hard"),
  };

  const getCourseSlug = (course: Course) => {
    return course.title.toLowerCase().replace(/\s+/g, "-");
  };

  const isGameCourse = (course: Course) => {
    const gameKeywords = ["challenge", "game", "puzzle"];
    return gameKeywords.some((keyword) => 
      course.title.toLowerCase().includes(keyword)
    );
  };

  const getCourseRoute = (course: Course) => {
    const slug = getCourseSlug(course);
    return isGameCourse(course) ? `/game/${slug}` : `/learn/${slug}`;
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
            <h1 className="text-4xl font-bold mb-2">{role} Courses</h1>
            <p className="text-muted-foreground">
              Choose a course to begin learning. Each course has 4 questions.
            </p>
          </div>

          {/* Easy Courses */}
          {groupedCourses.easy.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>Easy</span>
                <Badge className={getDifficultyColor("easy")}>Beginner</Badge>
              </h2>
              <div className="grid gap-4">
                {groupedCourses.easy.map((course) => {
                  const courseProgress = progress[course.id];
                  const isCompleted = courseProgress?.completed_at !== null;
                  const progressPercent = courseProgress
                    ? (courseProgress.questions_answered / courseProgress.total_questions) * 100
                    : 0;

                  return (
                    <Card
                      key={course.id}
                      className="hover-lift cursor-pointer transition-all"
                      onClick={() => navigate(getCourseRoute(course))}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {course.title}
                              {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </div>
                          {isGameCourse(course) ? (
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {courseProgress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {courseProgress.questions_answered} / {courseProgress.total_questions} questions
                              </span>
                              <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} />
                          </div>
                        )}
                        {!courseProgress && (
                          <Button variant="secondary" className="w-full">
                            Start Course
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medium Courses */}
          {groupedCourses.medium.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>Medium</span>
                <Badge className={getDifficultyColor("medium")}>Intermediate</Badge>
              </h2>
              <div className="grid gap-4">
                {groupedCourses.medium.map((course) => {
                  const courseProgress = progress[course.id];
                  const isCompleted = courseProgress?.completed_at !== null;
                  const progressPercent = courseProgress
                    ? (courseProgress.questions_answered / courseProgress.total_questions) * 100
                    : 0;

                  return (
                    <Card
                      key={course.id}
                      className="hover-lift cursor-pointer transition-all"
                      onClick={() => navigate(getCourseRoute(course))}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {course.title}
                              {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </div>
                          {isGameCourse(course) ? (
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {courseProgress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {courseProgress.questions_answered} / {courseProgress.total_questions} questions
                              </span>
                              <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} />
                          </div>
                        )}
                        {!courseProgress && (
                          <Button variant="secondary" className="w-full">
                            Start Course
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hard Courses */}
          {groupedCourses.hard.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>Hard</span>
                <Badge className={getDifficultyColor("hard")}>Advanced</Badge>
              </h2>
              <div className="grid gap-4">
                {groupedCourses.hard.map((course) => {
                  const courseProgress = progress[course.id];
                  const isCompleted = courseProgress?.completed_at !== null;
                  const progressPercent = courseProgress
                    ? (courseProgress.questions_answered / courseProgress.total_questions) * 100
                    : 0;

                  return (
                    <Card
                      key={course.id}
                      className="hover-lift cursor-pointer transition-all"
                      onClick={() => navigate(getCourseRoute(course))}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {course.title}
                              {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </div>
                          {isGameCourse(course) ? (
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {courseProgress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {courseProgress.questions_answered} / {courseProgress.total_questions} questions
                              </span>
                              <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} />
                          </div>
                        )}
                        {!courseProgress && (
                          <Button variant="secondary" className="w-full">
                            Start Course
                          </Button>
                        )}
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

export default CourseList;
