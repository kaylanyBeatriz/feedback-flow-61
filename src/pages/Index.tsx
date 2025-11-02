import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
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

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-lg text-muted-foreground">
              Recursos poderosos para transformar feedback em crescimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 bg-gradient-primary overflow-hidden">
            <CardContent className="p-12 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Comece a coletar feedbacks valiosos hoje mesmo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/feedback")}
                  className="text-lg px-8"
                >
                  Enviar Feedback Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-20">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Plataforma de Feedback. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
