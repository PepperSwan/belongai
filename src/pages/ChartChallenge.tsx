import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCcw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface PieSlice {
  id: number;
  percentage: number;
  color: string;
  label: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const challenges = {
  easy: {
    title: "Chart Challenge",
    description: "Drag the sliders to create a pie chart matching the target values",
    target: [30, 60, 10],
    labels: ["Product A", "Product B", "Product C"],
    tolerance: 5,
  },
  medium: {
    title: "Data Pattern Game",
    description: "Create a pie chart with the exact distribution shown",
    target: [25, 35, 25, 15],
    labels: ["Q1", "Q2", "Q3", "Q4"],
    tolerance: 3,
  },
  hard: {
    title: "Analytics Puzzle",
    description: "Match the complex distribution precisely",
    target: [18, 27, 22, 19, 14],
    labels: ["North", "South", "East", "West", "Central"],
    tolerance: 2,
  },
};

const ChartChallenge = () => {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Determine difficulty based on courseSlug
  const difficulty = courseSlug?.includes("pattern") 
    ? "medium" 
    : courseSlug?.includes("puzzle") 
    ? "hard" 
    : "easy";
  
  const challenge = challenges[difficulty];
  
  const [slices, setSlices] = useState<PieSlice[]>(() => 
    challenge.target.map((_, i) => ({
      id: i,
      percentage: 100 / challenge.target.length,
      color: COLORS[i % COLORS.length],
      label: challenge.labels[i],
    }))
  );
  
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Draw pie chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let startAngle = -Math.PI / 2;
    
    slices.forEach((slice) => {
      const sliceAngle = (slice.percentage / 100) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(slice.percentage)}%`, labelX, labelY);
      
      startAngle += sliceAngle;
    });
  }, [slices]);

  const handleSliderChange = (id: number, newValue: number) => {
    setSlices((prev) => {
      const oldValue = prev.find((s) => s.id === id)?.percentage || 0;
      const diff = newValue - oldValue;
      
      // Distribute the difference among other slices proportionally
      const others = prev.filter((s) => s.id !== id);
      const totalOthers = others.reduce((sum, s) => sum + s.percentage, 0);
      
      return prev.map((slice) => {
        if (slice.id === id) {
          return { ...slice, percentage: newValue };
        }
        if (totalOthers > 0) {
          const proportion = slice.percentage / totalOthers;
          const newPercentage = Math.max(1, slice.percentage - diff * proportion);
          return { ...slice, percentage: newPercentage };
        }
        return slice;
      });
    });
  };

  const normalizeSlices = () => {
    setSlices((prev) => {
      const total = prev.reduce((sum, s) => sum + s.percentage, 0);
      return prev.map((s) => ({
        ...s,
        percentage: (s.percentage / total) * 100,
      }));
    });
  };

  const checkAnswer = () => {
    normalizeSlices();
    
    const isCorrect = slices.every((slice, i) => {
      const target = challenge.target[i];
      return Math.abs(slice.percentage - target) <= challenge.tolerance;
    });
    
    if (isCorrect) {
      setIsComplete(true);
      toast.success("Perfect! You matched the chart correctly!");
    } else {
      toast.error("Not quite right. Keep adjusting the slices!");
    }
  };

  const resetChart = () => {
    setSlices(
      challenge.target.map((_, i) => ({
        id: i,
        percentage: 100 / challenge.target.length,
        color: COLORS[i % COLORS.length],
        label: challenge.labels[i],
      }))
    );
    setIsComplete(false);
    setShowHint(false);
  };

  const totalPercentage = slices.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{challenge.title}</h1>
            <p className="text-sm text-muted-foreground capitalize">{difficulty} Level</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Target: {challenge.target.join("% / ")}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </CardTitle>
            <p className="text-muted-foreground">{challenge.description}</p>
            {showHint && (
              <p className="text-sm text-primary/80 bg-primary/5 p-2 rounded-md mt-2">
                Hint: Adjust each slider to match the target percentages. 
                Tolerance: ±{challenge.tolerance}%
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart Canvas */}
              <div className="flex justify-center items-center">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="rounded-lg border border-border/40"
                />
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {slices.map((slice, index) => (
                  <div key={slice.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: slice.color }}
                        />
                        {slice.label}
                      </span>
                      <span className="font-mono">
                        {Math.round(slice.percentage)}%
                        <span className="text-muted-foreground ml-2">
                          (target: {challenge.target[index]}%)
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={slice.percentage}
                      onChange={(e) => handleSliderChange(slice.id, Number(e.target.value))}
                      disabled={isComplete}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${slice.color} ${slice.percentage}%, hsl(var(--muted)) ${slice.percentage}%)`,
                      }}
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border/40">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total</span>
                    <span className={totalPercentage > 101 || totalPercentage < 99 ? "text-destructive" : "text-success"}>
                      {Math.round(totalPercentage)}%
                    </span>
                  </div>
                  <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={resetChart}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={checkAnswer} disabled={isComplete}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Check Answer
              </Button>
            </div>

            {isComplete && (
              <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-semibold text-success">Challenge Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You successfully created the pie chart with the correct distribution.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(-1)}
                >
                  Back to Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChartChallenge;
