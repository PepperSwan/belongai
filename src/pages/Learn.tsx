import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import QuestionInterface from "@/components/QuestionInterface";
import { getQuestionsForCourse, CourseQuestion } from "@/data/courseQuestions";
import { useToast } from "@/hooks/use-toast";

const Learn = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && courseSlug) {
      initializeCourse();
    }
  }, [user, courseSlug]);

  const initializeCourse = async () => {
    try {
      // Get questions from local data
      const courseQuestions = getQuestionsForCourse(courseSlug || "");
      
      if (courseQuestions.length === 0) {
        setLoading(false);
        return;
      }

      setQuestions(courseQuestions);

      // Fetch course info from database
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("title", courseQuestions[0].courseTitle)
        .single();

      if (courseError) throw courseError;

      setCourseId(course.id);
      setCourseInfo(course);

      // Check if user has progress for this course
      const { data: progress, error: progressError } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (progressError) throw progressError;

      if (!progress) {
        // Create new progress entry
        await supabase.from("user_course_progress").insert([
          {
            user_id: user!.id,
            course_id: course.id,
            questions_answered: 0,
            total_questions: courseQuestions.length,
            first_attempt_correct: 0,
            total_attempts: 0,
          },
        ]);
      } else {
        // Resume from where they left off (if not completed)
        if (!progress.completed_at) {
          setCurrentQuestionIndex(progress.questions_answered);
        }
      }
    } catch (error) {
      console.error("Error initializing course:", error);
      toast({
        title: "Error",
        description: "Failed to load course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (isCorrect: boolean, isFirstAttempt: boolean) => {
    if (!courseId || !user) return;

    try {
      // Fetch current progress
      const { data: progress, error: fetchError } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (fetchError) throw fetchError;

      // Update progress
      const updatedProgress: any = {
        questions_answered: progress.questions_answered + 1,
        first_attempt_correct: progress.first_attempt_correct + (isFirstAttempt && isCorrect ? 1 : 0),
        total_attempts: progress.total_attempts + 1,
        last_accessed: new Date().toISOString(),
      };

      // Check if course is completed
      const isCompleted = updatedProgress.questions_answered >= questions.length;
      if (isCompleted) {
        updatedProgress.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("user_course_progress")
        .update(updatedProgress)
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (updateError) throw updateError;

      // If course completed, update streak and check for trophies
      if (isCompleted) {
        await updateStreak();
        await checkAndAwardTrophies();
        
        toast({
          title: "🎉 Course Completed!",
          description: `You've completed ${courseInfo.title}! Check your trophies to see if you earned any new ones.`,
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      // Fetch current streak
      const { data: streak, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      if (!streak) {
        // Create new streak
        await supabase.from("user_streaks").insert([
          {
            user_id: user.id,
            current_streak: 1,
            max_streak: 1,
            last_activity_date: todayStr,
          },
        ]);
      } else {
        const lastActivity = streak.last_activity_date
          ? new Date(streak.last_activity_date)
          : null;

        if (lastActivity) {
          lastActivity.setHours(0, 0, 0, 0);
        }

        // Check if already active today
        if (lastActivity && lastActivity.toDateString() === today.toDateString()) {
          return; // Already counted for today
        }

        // Check if yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = 1;
        if (lastActivity && lastActivity.toDateString() === yesterday.toDateString()) {
          // Continue streak
          newStreak = streak.current_streak + 1;
        }

        const newMaxStreak = Math.max(newStreak, streak.max_streak);

        await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            max_streak: newMaxStreak,
            last_activity_date: todayStr,
          })
          .eq("user_id", user.id);

        // Check for streak trophies
        await checkStreakTrophies(newStreak);
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const checkStreakTrophies = async (currentStreak: number) => {
    if (!user) return;

    const streakMilestones = [
      { days: 7, name: "On Fire" },
      { days: 30, name: "Unstoppable" },
    ];

    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone.days) {
        await awardTrophyByName(milestone.name);
      }
    }
  };

  const checkAndAwardTrophies = async () => {
    if (!user || !courseInfo) return;

    try {
      // Award "First Steps" trophy
      await awardTrophyByName("First Steps");

      // Award role-specific trophy (The Data Trophy, etc.)
      if (courseInfo.role === "Data Analyst") {
        await awardTrophyByName("The Data Trophy");
      } else if (courseInfo.role.includes("UX") || courseInfo.role.includes("Design")) {
        await awardTrophyByName("The Design Trophy");
      }

      // Check for Data Master / Data Expert
      if (courseInfo.role === "Data Analyst") {
        const { data: allDataCourses } = await supabase
          .from("courses")
          .select("id")
          .eq("role", "Data Analyst");

        const { data: completedDataCourses } = await supabase
          .from("user_course_progress")
          .select("course_id")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .in(
            "course_id",
            allDataCourses?.map((c) => c.id) || []
          );

        const totalDataCourses = allDataCourses?.length || 0;
        const completedCount = completedDataCourses?.length || 0;
        const percentage = (completedCount / totalDataCourses) * 100;

        if (percentage >= 100) {
          await awardTrophyByName("Data Expert");
        } else if (percentage >= 50) {
          await awardTrophyByName("Data Master");
        }
      }

      // Check for Jack of All Trades
      const { data: completedRoles } = await supabase
        .from("user_course_progress")
        .select("courses(role)")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      if (completedRoles) {
        const uniqueRoles = new Set(completedRoles.map((c: any) => c.courses.role));
        if (uniqueRoles.size >= 3) {
          await awardTrophyByName("The Jack of All Trades");
        }
      }

      // Check for time-based trophies
      const now = new Date();
      const hour = now.getHours();

      if (hour < 9) {
        await awardTrophyByName("Early Bird");
      } else if (hour >= 22) {
        await awardTrophyByName("Night Owl");
      }
    } catch (error) {
      console.error("Error checking trophies:", error);
    }
  };

  const awardTrophyByName = async (trophyName: string) => {
    if (!user) return;

    try {
      // Find trophy by name
      const { data: trophy, error: trophyError } = await supabase
        .from("trophies")
        .select("id")
        .eq("name", trophyName)
        .maybeSingle();

      if (trophyError || !trophy) return;

      // Check if user already has this trophy
      const { data: existing } = await supabase
        .from("user_trophies")
        .select("id")
        .eq("user_id", user.id)
        .eq("trophy_id", trophy.id)
        .maybeSingle();

      if (existing) return; // Already have this trophy

      // Award trophy
      await supabase.from("user_trophies").insert([
        {
          user_id: user.id,
          trophy_id: trophy.id,
        },
      ]);

      toast({
        title: `🏆 Trophy Earned!`,
        description: `You earned the "${trophyName}" trophy!`,
      });
    } catch (error) {
      console.error("Error awarding trophy:", error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Course completed, navigate back
      toast({
        title: "Course Completed!",
        description: "Great job! Check your progress and trophies.",
      });
      navigate(`/courses/${courseInfo.role}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground mb-6">
            Questions for this course are being prepared. Check back soon!
          </p>
          <Link to="/roles">
            <Button>Back to Roles</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to={`/courses/${courseInfo?.role || ""}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">{courseInfo?.title}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <QuestionInterface
          question={currentQuestion}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onNext={handleNext}
          onAnswerSubmit={handleAnswerSubmit}
        />
      </main>
    </div>
  );
};

export default Learn;
