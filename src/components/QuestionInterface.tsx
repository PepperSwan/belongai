import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useState } from "react";

interface Option {
  id: string;
  text: string;
}

const sampleQuestion = {
  role: "Data Analyst",
  level: "Easy",
  title: "Find the Pattern",
  description: "Look at the sales data below and answer the question.",
  data: [
    { day: "Mon", apples: 3 },
    { day: "Tue", apples: 5 },
    { day: "Wed", apples: 2 },
    { day: "Thu", apples: 7 },
    { day: "Fri", apples: 5 },
  ],
  question: "Which day sold the most apples?",
  options: [
    { id: "a", text: "Monday" },
    { id: "b", text: "Tuesday" },
    { id: "c", text: "Wednesday" },
    { id: "d", text: "Thursday" },
  ],
  correctAnswer: "d",
  points: 10,
};

const QuestionInterface = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = () => {
    setIsChecked(true);
  };

  const isCorrect = selectedAnswer === sampleQuestion.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {sampleQuestion.role}
          </Badge>
          <h2 className="text-2xl font-bold">{sampleQuestion.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <span className="font-semibold">{sampleQuestion.points} pts</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question 1 of 5</span>
          <span>Level: {sampleQuestion.level}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/5 transition-all duration-300" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="card-base p-6 space-y-6">
        {/* Description */}
        <p className="text-lg">{sampleQuestion.description}</p>

        {/* Data Display */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="font-semibold text-sm text-muted-foreground mb-3">SALES DATA</div>
          <div className="grid grid-cols-5 gap-2">
            {sampleQuestion.data.map((item) => (
              <div key={item.day} className="text-center space-y-1">
                <div className="text-sm font-medium">{item.day}</div>
                <div className="text-2xl font-bold text-primary">{item.apples}</div>
                <div className="text-xs text-muted-foreground">apples</div>
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <p className="font-semibold text-lg">{sampleQuestion.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {sampleQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const showCorrect = isChecked && option.id === sampleQuestion.correctAnswer;
              const showWrong = isChecked && isSelected && !isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => !isChecked && setSelectedAnswer(option.id)}
                  disabled={isChecked}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showCorrect
                      ? "border-success bg-success/10"
                      : showWrong
                      ? "border-destructive bg-destructive/10"
                      : isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${isChecked ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {showWrong && <XCircle className="w-5 h-5 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        {!isChecked ? (
          <Button
            size="lg"
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            size="lg"
            className={isCorrect ? "bg-success hover:bg-success/90" : "bg-secondary hover:bg-secondary/90"}
          >
            {isCorrect ? "Continue +" + sampleQuestion.points : "Try Again"}
          </Button>
        )}
      </div>

      {/* Feedback */}
      {isChecked && (
        <Card className={`card-base p-4 animate-scale-in ${isCorrect ? "border-success" : "border-secondary"}`}>
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">
                {isCorrect ? "Excellent work! 🎉" : "Not quite right"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isCorrect
                  ? "Thursday had the highest sales with 7 apples sold."
                  : "Look at the numbers carefully - which day has the highest value?"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestionInterface;
