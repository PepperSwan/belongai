import { BarChart3, LineChart, PieChart, ScatterChart } from "lucide-react";

interface ChartVisualProps {
  type: "line" | "bar" | "pie" | "scatter" | "area";
  className?: string;
}

const ChartVisual = ({ type, className = "" }: ChartVisualProps) => {
  const baseClass = `w-full h-20 flex items-center justify-center rounded-md ${className}`;
  
  switch (type) {
    case "line":
      return (
        <div className={`${baseClass} bg-muted/50`}>
          <svg viewBox="0 0 100 40" className="w-full h-full p-2">
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              points="5,35 20,28 35,32 50,18 65,22 80,12 95,8"
            />
            <line x1="5" y1="35" x2="95" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
            <line x1="5" y1="5" x2="5" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </svg>
        </div>
      );
    
    case "bar":
      return (
        <div className={`${baseClass} bg-muted/50`}>
          <svg viewBox="0 0 100 40" className="w-full h-full p-2">
            <rect x="10" y="20" width="12" height="15" fill="hsl(var(--primary))" rx="1" />
            <rect x="28" y="10" width="12" height="25" fill="hsl(var(--primary))" rx="1" />
            <rect x="46" y="15" width="12" height="20" fill="hsl(var(--primary))" rx="1" />
            <rect x="64" y="8" width="12" height="27" fill="hsl(var(--primary))" rx="1" />
            <rect x="82" y="12" width="12" height="23" fill="hsl(var(--primary))" rx="1" />
            <line x1="5" y1="35" x2="95" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </svg>
        </div>
      );
    
    case "pie":
      return (
        <div className={`${baseClass} bg-muted/50`}>
          <svg viewBox="0 0 100 50" className="w-full h-full p-2">
            <circle cx="50" cy="25" r="20" fill="hsl(var(--muted))" />
            <path
              d="M50,25 L50,5 A20,20 0 0,1 70,25 Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M50,25 L70,25 A20,20 0 0,1 50,45 Z"
              fill="hsl(var(--secondary))"
            />
            <path
              d="M50,25 L50,45 A20,20 0 0,1 30,25 Z"
              fill="hsl(var(--accent))"
            />
            <path
              d="M50,25 L30,25 A20,20 0 0,1 50,5 Z"
              fill="hsl(var(--muted-foreground)/0.5)"
            />
          </svg>
        </div>
      );
    
    case "scatter":
      return (
        <div className={`${baseClass} bg-muted/50`}>
          <svg viewBox="0 0 100 40" className="w-full h-full p-2">
            <circle cx="15" cy="28" r="3" fill="hsl(var(--primary))" />
            <circle cx="25" cy="22" r="3" fill="hsl(var(--primary))" />
            <circle cx="35" cy="25" r="3" fill="hsl(var(--primary))" />
            <circle cx="48" cy="18" r="3" fill="hsl(var(--primary))" />
            <circle cx="55" cy="15" r="3" fill="hsl(var(--primary))" />
            <circle cx="70" cy="12" r="3" fill="hsl(var(--primary))" />
            <circle cx="80" cy="10" r="3" fill="hsl(var(--primary))" />
            <circle cx="90" cy="8" r="3" fill="hsl(var(--primary))" />
            <line x1="5" y1="35" x2="95" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
            <line x1="5" y1="5" x2="5" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </svg>
        </div>
      );
    
    case "area":
      return (
        <div className={`${baseClass} bg-muted/50`}>
          <svg viewBox="0 0 100 40" className="w-full h-full p-2">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M5,35 L5,28 L20,24 L35,26 L50,18 L65,20 L80,12 L95,10 L95,35 Z"
              fill="url(#areaGradient)"
            />
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              points="5,28 20,24 35,26 50,18 65,20 80,12 95,10"
            />
            <line x1="5" y1="35" x2="95" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </svg>
        </div>
      );
    
    default:
      return null;
  }
};

export default ChartVisual;
