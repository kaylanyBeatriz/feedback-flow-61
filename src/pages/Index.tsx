import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Feedback Anônimo",
      description: "Colete opiniões honestas de forma 100% anônima e segura",
    },
    {
      icon: BarChart,
      title: "Dashboard Analytics",
      description: "Visualize dados e estatísticas em tempo real",
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados protegidos com tecnologia de ponta",
    },
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Interface intuitiva para uma experiência sem fricção",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="w-full bg-card shadow-md fixed top-0 z-50"
            style={{
            backgroundColor: "#CFCFCF", // Cor inicial do header
          }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">Feedback</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 mt-16 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-xl">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Plataforma de
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Feedback</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Colete, analise e aja com base em feedbacks valiosos para melhorar continuamente seu serviço
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/feedback")}
                className="bg-gradient-primary text-lg px-8 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Responder Feedback
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8"
              >
                Acessar Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-card border-t py-4 mt-auto"
          style={{
            backgroundColor: "#CFCFCF", // Cor inicial do header
          }}>
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Plataforma de Feedback. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
