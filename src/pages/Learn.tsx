import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import QuestionInterface from "@/components/QuestionInterface";
import { getQuestionsForRole } from "@/data/questions";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const Learn = () => {
  const { role } = useParams<{ role: string }>();
  const questions = getQuestionsForRole(role || "");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground mb-6">
            Questions for this role are being prepared. Check back soon!
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
          <Link to="/roles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="font-semibold">{totalScore} pts</span>
            </div>
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
        />
      </main>
    </div>
  );
};

export default Learn;
