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
          <div className="mb-4"></div>

          {/* Badge - Angular/Geometric Style */}

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Belong<span className="text-gradient">AI</span>
          </h1>

          {/* Subheader Badge */}
          <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-l-4 border-r-4 border-secondary backdrop-blur-sm">
            <p className="text-lg md:text-xl font-medium text-muted-foreground">🌱 From Imposter to Belonger 🤝</p>
          </div>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Overcome imposter syndrome through gamified, real-world tasks that simulate what professionals actually do
            every day. <br /> No experience needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 max-w-2xl mx-auto w-full">
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-2 w-full sm:min-w-[200px]">
                See How It Works
              </Button>
            </a>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all w-full sm:min-w-[200px]"
              >
                Login / Create Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
