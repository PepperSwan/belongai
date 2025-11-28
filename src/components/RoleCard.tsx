import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  skillsCount: number;
  lessonsCount: number;
  color: "primary" | "secondary" | "success";
  delay?: number;
}

const RoleCard = ({ 
  icon: Icon, 
  title, 
  description, 
  skillsCount, 
  lessonsCount, 
  color,
  delay = 0 
}: RoleCardProps) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    success: "bg-success/10 text-success border-success/20",
  };

  return (
    <Card 
      className="card-base hover-lift p-6 space-y-4 group cursor-pointer transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon Badge */}
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">{skillsCount} skills</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-muted-foreground">{lessonsCount} lessons</span>
        </div>
      </div>

      {/* CTA */}
      <Link to={`/learn/${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <Button variant="ghost" className="w-full group/btn justify-between">
          Start Learning
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </Card>
  );
};

export default RoleCard;
