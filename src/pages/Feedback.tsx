import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { MessageSquare, Send, CheckCircle } from "lucide-react";

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    satisfaction: "",
    recommendation: "",
    experience: "",
    improvements: "",
    contact: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.satisfaction || !formData.recommendation) {
      toast.error("Por favor, responda todas as questões obrigatórias");
      return;
    }

    // Aqui será integrado com o backend
    console.log("Feedback enviado:", formData);
    setSubmitted(true);
    toast.success("Feedback enviado com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Obrigado!</CardTitle>
            <CardDescription className="text-base">
              Seu feedback foi enviado com sucesso. Suas opiniões são muito importantes para nós!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  satisfaction: "",
                  recommendation: "",
                  experience: "",
                  improvements: "",
                  contact: "",
                });
              }}
              variant="outline"
              className="w-full"
            >
              Enviar outro feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Formulário de Feedback</h1>
          <p className="text-muted-foreground text-lg">
            Sua opinião é essencial para melhorarmos nossos serviços
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle>Compartilhe sua experiência</CardTitle>
            <CardDescription>
              Este formulário é anônimo e levará apenas alguns minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Questão 1 - Satisfação */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  1. Como você avalia sua satisfação geral? *
                </Label>
                <RadioGroup
                  value={formData.satisfaction}
                  onValueChange={(value) => setFormData({ ...formData, satisfaction: value })}
                  className="space-y-3"
                >
                  {["Muito Satisfeito", "Satisfeito", "Neutro", "Insatisfeito", "Muito Insatisfeito"].map((option) => (
                    <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option} id={`satisfaction-${option}`} />
                      <Label htmlFor={`satisfaction-${option}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Questão 2 - Recomendação */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  2. Você recomendaria nosso serviço? *
                </Label>
                <RadioGroup
                  value={formData.recommendation}
                  onValueChange={(value) => setFormData({ ...formData, recommendation: value })}
                  className="space-y-3"
                >
                  {["Definitivamente Sim", "Provavelmente Sim", "Talvez", "Provavelmente Não", "Definitivamente Não"].map((option) => (
                    <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option} id={`recommendation-${option}`} />
                      <Label htmlFor={`recommendation-${option}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Questão 3 - Experiência */}
              <div className="space-y-4">
                <Label htmlFor="experience" className="text-base font-semibold">
                  3. Descreva sua experiência com nosso serviço
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Compartilhe sua experiência conosco..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Questão 4 - Melhorias */}
              <div className="space-y-4">
                <Label htmlFor="improvements" className="text-base font-semibold">
                  4. O que podemos melhorar?
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Suas sugestões são muito importantes..."
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Questão 5 - Contato (opcional) */}
              <div className="space-y-4">
                <Label htmlFor="contact" className="text-base font-semibold">
                  5. E-mail para contato (opcional)
                </Label>
                <Input
                  id="contact"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Caso queira que entremos em contato com você
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Este formulário é 100% anônimo e seguro</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
