import RoleCard from "@/components/RoleCard";
import { BarChart3, Palette, Bug, ListChecks, Code, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: BarChart3,
    title: "Data Analyst",
    description: "Find patterns in data, create insights, and make data-driven decisions through real-world scenarios.",
    skillsCount: 8,
    lessonsCount: 24,
    color: "primary" as const,
  },
  {
    icon: Palette,
    title: "UX Designer",
    description: "Improve user experiences by identifying confusing interfaces and suggesting clear improvements.",
    skillsCount: 7,
    lessonsCount: 21,
    color: "secondary" as const,
  },
  {
    icon: Bug,
    title: "QA Tester",
    description: "Find bugs and mistakes in processes, test scenarios, and ensure everything works smoothly.",
    skillsCount: 6,
    lessonsCount: 18,
    color: "success" as const,
  },
  {
    icon: ListChecks,
    title: "Product Manager",
    description: "Prioritize tasks, manage projects, and make strategic decisions to deliver successful products.",
    skillsCount: 9,
    lessonsCount: 27,
    color: "primary" as const,
  },
  {
    icon: Code,
    title: "Software Developer",
    description: "Debug code, solve logic puzzles, and learn programming concepts through practical challenges.",
    skillsCount: 10,
    lessonsCount: 30,
    color: "secondary" as const,
  },
  {
    icon: Megaphone,
    title: "Digital Marketer",
    description: "Create campaigns, analyze metrics, and optimize strategies for maximum impact and reach.",
    skillsCount: 7,
    lessonsCount: 21,
    color: "success" as const,
  },
];

const Roles = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h2 className="text-lg font-semibold">Choose Your Path</h2>
          <div className="w-20" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">
              Choose Your <span className="text-gradient">Tech Role</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a career path and start learning through real-world, gamified tasks
            </p>
          </div>

          {/* Roles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {roles.map((role, index) => (
              <RoleCard
                key={role.title}
                {...role}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="text-center pt-8 space-y-4 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-muted text-sm font-medium">
              More roles coming soon
            </div>
            <p className="text-muted-foreground">
              Want to see a specific tech role? Let us know!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roles;
