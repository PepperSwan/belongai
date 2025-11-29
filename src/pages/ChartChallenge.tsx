import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCcw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Slice {
  id: number;
  value: number;
  color: string;
  label: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

type ChartType = "pie" | "bar" | "line";

const hardScenarios = [
  {
    title: "🎃 Pumpkin Searches Trend",
    chartType: "line" as ChartType,
    description: "Shape the search trend for 'pumpkin' throughout the year. Think about Halloween!",
    target: [10, 15, 25, 85, 15, 10],
    labels: ["Sep", "Early Oct", "Late Oct", "Halloween", "Nov", "Dec"],
    tolerance: 10,
  },
  {
    title: "☀️ Sunscreen Searches Trend",
    chartType: "line" as ChartType,
    description: "Shape the search trend for 'sunscreen' throughout the year. Consider summer weather!",
    target: [20, 45, 80, 90, 50, 15],
    labels: ["Mar", "May", "Jun", "Jul", "Sep", "Dec"],
    tolerance: 10,
  },
  {
    title: "📚 School Books Searches Trend",
    chartType: "line" as ChartType,
    description: "Shape the search trend for 'school books'. Think about back-to-school season!",
    target: [15, 20, 90, 70, 25, 10],
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Dec"],
    tolerance: 10,
  },
];

const challenges = {
  easy: {
    title: "Chart Challenge",
    chartType: "pie" as ChartType,
    description: "Create a pie chart matching the target distribution",
    target: [30, 50, 20],
    labels: ["Product A", "Product B", "Product C"],
    tolerance: 8,
  },
  medium: {
    title: "🌧️ Seasonal Rainfall",
    chartType: "bar" as ChartType,
    description: "Shape the rainfall amounts for each quarter. Think about typical weather patterns!",
    target: [65, 45, 25, 55],
    labels: ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"],
    tolerance: 10,
  },
  hard: hardScenarios[Math.floor(Math.random() * hardScenarios.length)],
};

const ChartChallenge = () => {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const difficulty = courseSlug?.includes("pattern") 
    ? "medium" 
    : courseSlug?.includes("puzzle") 
    ? "hard" 
    : "easy";
  
  const challenge = challenges[difficulty];
  
  const [slices, setSlices] = useState<Slice[]>(() => 
    challenge.target.map((_, i) => ({
      id: i,
      value: challenge.chartType === "pie" ? 100 / challenge.target.length : 50,
      color: COLORS[i % COLORS.length],
      label: challenge.labels[i],
    }))
  );
  
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (challenge.chartType === "pie") {
      drawPieChart(ctx, canvas);
    } else if (challenge.chartType === "bar") {
      drawBarChart(ctx, canvas);
    } else if (challenge.chartType === "line") {
      drawLineChart(ctx, canvas);
    }
  }, [slices, challenge.chartType]);

  const drawPieChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    let startAngle = -Math.PI / 2;
    
    slices.forEach((slice) => {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      startAngle += sliceAngle;
    });
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / slices.length - 20;
    
    // Draw axes
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw bars
    slices.forEach((slice, i) => {
      const x = padding + 10 + i * (barWidth + 20);
      const barHeight = (slice.value / 100) * chartHeight;
      const y = canvas.height - padding - barHeight;
      
      ctx.fillStyle = slice.color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(slice.label, x + barWidth / 2, canvas.height - padding + 20);
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Draw axes
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Calculate points
    const points = slices.map((slice, i) => ({
      x: padding + (i * chartWidth) / (slices.length - 1),
      y: canvas.height - padding - (slice.value / 100) * chartHeight,
      color: slice.color,
      label: slice.label,
    }));
    
    // Draw line
    ctx.strokeStyle = COLORS[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    
    // Draw points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(point.label, point.x, canvas.height - padding + 20);
    });
  };

  const handleSliderChange = (id: number, newValue: number) => {
    if (challenge.chartType === "pie") {
      setSlices((prev) => {
        const oldValue = prev.find((s) => s.id === id)?.value || 0;
        const diff = newValue - oldValue;
        const others = prev.filter((s) => s.id !== id);
        const totalOthers = others.reduce((sum, s) => sum + s.value, 0);
        
        return prev.map((slice) => {
          if (slice.id === id) return { ...slice, value: newValue };
          if (totalOthers > 0) {
            const proportion = slice.value / totalOthers;
            return { ...slice, value: Math.max(1, slice.value - diff * proportion) };
          }
          return slice;
        });
      });
    } else {
      setSlices((prev) =>
        prev.map((slice) =>
          slice.id === id ? { ...slice, value: newValue } : slice
        )
      );
    }
  };

  const checkAnswer = () => {
    let userValues: number[];
    
    if (challenge.chartType === "pie") {
      const total = slices.reduce((sum, s) => sum + s.value, 0);
      userValues = slices.map((s) => (s.value / total) * 100);
    } else {
      userValues = slices.map((s) => s.value);
    }
    
    const isCorrect = userValues.every((val, i) => {
      const target = challenge.target[i];
      return Math.abs(val - target) <= challenge.tolerance;
    });
    
    if (isCorrect) {
      setIsComplete(true);
      setShowAnswer(false);
      toast.success("Perfect! You matched the chart correctly!");
    } else {
      setShowAnswer(true);
      toast.error("Not quite right. The correct answer is shown below.");
    }
  };

  const resetChart = () => {
    setSlices(
      challenge.target.map((_, i) => ({
        id: i,
        value: challenge.chartType === "pie" ? 100 / challenge.target.length : 50,
        color: COLORS[i % COLORS.length],
        label: challenge.labels[i],
      }))
    );
    setIsComplete(false);
    setShowHint(false);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{challenge.title}</h1>
            <p className="text-sm text-muted-foreground capitalize">{difficulty} Level • {challenge.chartType} chart</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Target: {challenge.target.join(challenge.chartType === "pie" ? "% / " : " / ")}{challenge.chartType === "pie" ? "%" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
            </CardTitle>
            <p className="text-muted-foreground">{challenge.description}</p>
            {showHint && (
              <p className="text-sm text-primary/80 bg-primary/5 p-2 rounded-md mt-2">
                Hint: Tolerance is ±{challenge.tolerance}{challenge.chartType === "pie" ? "%" : " units"}. Trust your visual estimation!
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex justify-center items-center bg-muted/30 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-4">
                {slices.map((slice, index) => {
                  const userValue = challenge.chartType === "pie" 
                    ? Math.round((slice.value / slices.reduce((sum, s) => sum + s.value, 0)) * 100)
                    : Math.round(slice.value);
                  const targetValue = challenge.target[index];
                  const isSliceCorrect = Math.abs(userValue - targetValue) <= challenge.tolerance;
                  
                  return (
                    <div key={slice.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="font-medium">{slice.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Your: {userValue}{challenge.chartType === "pie" ? "%" : ""}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={challenge.chartType === "pie" ? "80" : "100"}
                        value={slice.value}
                        onChange={(e) => handleSliderChange(slice.id, Number(e.target.value))}
                        disabled={isComplete}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${slice.color} ${slice.value}%, hsl(var(--muted)) ${slice.value}%)`,
                        }}
                      />
                      {showAnswer && !isComplete && (
                        <div className={`text-sm ${isSliceCorrect ? 'text-green-600' : 'text-red-500'}`}>
                          Correct: {targetValue}{challenge.chartType === "pie" ? "%" : ""} 
                          {isSliceCorrect ? ' ✓' : ` (off by ${Math.abs(userValue - targetValue)})`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

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
                  You successfully created the {challenge.chartType} chart!
                </p>
                <Button className="mt-4" onClick={() => navigate(-1)}>
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
