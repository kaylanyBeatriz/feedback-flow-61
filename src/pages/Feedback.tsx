import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import vinciLogo from "@/assets/vinci-logo.png";

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    rapidez: 0,
    apresentacao: 0,
    tempoEspera: 0,
    limpeza: 0,
    experienciaGeral: 0,
    comoConheceu: "",
    sugestoes: "",
  });

  const questions = [
    { id: "rapidez", text: "Como você avalia a rapidez no atendimento?" },
    { id: "apresentacao", text: "Como você avalia a apresentação do prato/lanche?" },
    { id: "tempoEspera", text: "Como você avalia o tempo de espera até receber o pedido?" },
    { id: "limpeza", text: "Como você avalia a limpeza do local?" },
    { id: "experienciaGeral", text: "Como você avalia a experiência geral na lanchonete?" },
  ];

  const handleRatingClick = (questionId: string, rating: number) => {
    setFormData({ ...formData, [questionId]: rating });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allRated = questions.every((q) => {
      const value = formData[q.id as keyof typeof formData];
      return typeof value === "number" && value > 0;
    });
    
    if (!allRated) {
      toast.error("Por favor, responda todas as avaliações");
      return;
    }

    console.log("Feedback enviado:", formData);
    setSubmitted(true);
    toast.success("Feedback enviado com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 bg-card shadow-xl">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-card-foreground">Obrigado!</h2>
          <p className="text-card-foreground/70 mb-6">
            Seu feedback foi enviado com sucesso. Suas opiniões são muito importantes para nós!
          </p>
          <Button 
            onClick={() => {
              setSubmitted(false);
              setFormData({
                rapidez: 0,
                apresentacao: 0,
                tempoEspera: 0,
                limpeza: 0,
                experienciaGeral: 0,
                comoConheceu: "",
                sugestoes: "",
              });
            }}
            className="w-full bg-[hsl(var(--btn-rating))] hover:bg-[hsl(var(--btn-rating-hover))] text-card-foreground"
          >
            Enviar outro feedback
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-foreground"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <img 
            src={vinciLogo} 
            alt="Vinci Burguer" 
            className="w-72 h-72 mx-auto mb-6 object-contain"
          />
          
          <h1 className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'serif' }}>
            FeedBack
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Questions */}
          {questions.map((question) => (
            <Card key={question.id} className="p-4 bg-card shadow-md">
              <p className="text-sm text-card-foreground mb-3 font-medium">
                {question.text}
              </p>
              <div className="flex justify-between gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(question.id, rating)}
                    className={`flex-1 h-12 rounded-lg font-bold text-lg transition-all ${
                      formData[question.id as keyof typeof formData] === rating
                        ? "bg-[hsl(var(--btn-rating))] text-card-foreground shadow-lg scale-105"
                        : "bg-[hsl(var(--btn-rating))]/60 text-card-foreground/70 hover:bg-[hsl(var(--btn-rating))]/80"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-card-foreground/60">Muito satisfeito</span>
                <span className="text-xs text-card-foreground/60">Insatisfeito</span>
              </div>
            </Card>
          ))}

          {/* Open Questions */}
          <Card className="p-4 bg-card shadow-md">
            <p className="text-sm text-card-foreground mb-3 font-medium">
              Como você conheceu a Vinci Burguer?
            </p>
            <Textarea
              placeholder="..."
              value={formData.comoConheceu}
              onChange={(e) => setFormData({ ...formData, comoConheceu: e.target.value })}
              className="min-h-[80px] resize-none bg-[hsl(var(--btn-rating))]/40 border-none text-card-foreground placeholder:text-card-foreground/50"
            />
          </Card>

          <Card className="p-4 bg-card shadow-md">
            <p className="text-sm text-card-foreground mb-3 font-medium">
              Tem alguma sugestão? Adoraríamos ouvir!
            </p>
            <Textarea
              placeholder="..."
              value={formData.sugestoes}
              onChange={(e) => setFormData({ ...formData, sugestoes: e.target.value })}
              className="min-h-[80px] resize-none bg-[hsl(var(--btn-rating))]/40 border-none text-card-foreground placeholder:text-card-foreground/50"
            />
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#4682B4] hover:bg-[#3d6fa0] text-white text-lg h-12 rounded-lg shadow-lg font-medium"
          >
            Enviar Feedback
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
