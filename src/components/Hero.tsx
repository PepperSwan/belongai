import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-tech.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="mb-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              BelongAI
            </h2>
          </div>

          {/* Badge - Angular/Geometric Style */}
          <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md border-l-4 border-r-4 border-secondary shadow-[0_0_20px_rgba(244,114,82,0.3)] hover:shadow-[0_0_40px_rgba(244,114,82,0.5)] transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-50"></div>
            <Sparkles className="w-5 h-5 text-secondary animate-pulse relative z-10" />
            <span className="text-base font-bold text-foreground relative z-10 group-hover:text-gradient transition-all">
              From Imposter to Belonger
            </span>
            <div className="absolute -left-1 top-0 w-1 h-full bg-primary"></div>
            <div className="absolute -right-1 top-0 w-1 h-full bg-primary"></div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Master Your Dream <span className="text-gradient">Tech Role</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Overcome imposter syndrome through gamified, real-world tasks that simulate what professionals actually do
            every day. <br /> No experience needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/roles">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2">
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Tech Roles</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-secondary">100%</div>
              <div className="text-sm text-muted-foreground">Interactive</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-success">Real</div>
              <div className="text-sm text-muted-foreground">Job Tasks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
