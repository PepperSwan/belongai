import { Gamepad2, Target, Trophy } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Target,
      title: "Choose Your Role",
      description: "Pick from 10+ tech roles like Product Manager, UX Designer, or Data Analyst based on your interests."
    },
    {
      icon: Gamepad2,
      title: "Complete Real Tasks",
      description: "Work through gamified scenarios that simulate actual day-to-day responsibilities of professionals in that role."
    },
    {
      icon: Trophy,
      title: "Build Confidence",
      description: "Gain practical experience and overcome imposter syndrome by proving to yourself you can do the work."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to go from curious to confident
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="card-base p-8 text-center hover-lift transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-6xl font-bold text-primary/20 mb-2">{index + 1}</div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
