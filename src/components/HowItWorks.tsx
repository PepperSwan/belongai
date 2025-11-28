import { Gamepad2, Target, Trophy } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Target,
      title: "Breaking Barriers",
      description: "For people from backgrounds which are underrepresented in tech, get bespoke advice on how best to use our platform and apply yourself in your journey to your dream tech role."
    },
    {
      icon: Gamepad2,
      title: "Find Your Path Match",
      description: "Tell us about any and all experience you have in your life, even in places where you think it might not matter! Our AI platform can help match your current skillset to skills you can utilise when moving into the tech world."
    },
    {
      icon: Trophy,
      title: "Start Learning",
      description: "Select from a wide range of different tech roles to take on gamified, real-world tasks that simulate what professionals actually do every day."
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
