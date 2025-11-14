import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import vinciLogo from "@/assets/vinci-logo.png";
import { supabase } from "@/lib/supabase";

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

  type FeedbackForm = { id: number; title: string | null };
  type DBQuestion = {
    id: number;
    question_text: string | null;
    question_type?: number | null;
  };

  const [feedbacks, setFeedbacks] = useState<FeedbackForm[]>([]);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const [dbQuestions, setDbQuestions] = useState<DBQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, { satisfaction?: number; answer_text?: string }>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("id, title")
        .order("id", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar formulários");
        return;
      }
      setFeedbacks(data || []);
      if (data && data.length > 0) {
        setSelectedFeedbackId(data[0].id);
      }
    };
    loadFeedbacks();
  }, []);

  useEffect(() => {
    const loadQuestions = async (formId: number) => {
      setLoadingQuestions(true);
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_text, question_type")
        .eq("feedback_id", formId)
        .order("id", { ascending: true });

      console.log("formId:", formId);

      if (error) {
        toast.error("Erro ao carregar perguntas");
        setDbQuestions([]);
      } else {
        setDbQuestions(data || []);
        setAnswers({});
      }
      setLoadingQuestions(false);
    };

    if (selectedFeedbackId) {
      loadQuestions(selectedFeedbackId);
    } else {
      setDbQuestions([]);
      setAnswers({});
    }
  }, [selectedFeedbackId]);

  const handleRatingClick = (questionId: number, rating: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), satisfaction: rating },
    }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), answer_text: text },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFeedbackId) {
      toast.error("Selecione um formulário");
      return;
    }

    const missing = dbQuestions.find((q) => {
      const type = (q.question_type ?? 0) as number;
      const a = answers[q.id] || {};
      if (type === 1) {
        return !(typeof a.satisfaction === "number" && a.satisfaction > 0);
      }
      return !(typeof a.answer_text === "string" && a.answer_text.trim().length > 0);
    });

    if (missing) {
      toast.error("Por favor, responda todas as perguntas");
      return;
    }

    setSubmitting(true);
    const rows = dbQuestions.map((q) => {
      const type = (q.question_type ?? 0) as number;
      const a = answers[q.id] || {};
      return {
        question_id: q.id,
        satisfaction: type === 1 ? (a.satisfaction ?? null) : null,
        answer_text: type === 0 ? (a.answer_text ?? null) : null,
      };
    });

    const { error } = await supabase.from("answers").insert(rows);
    setSubmitting(false);

    if (error) {
      toast.error("Erro ao enviar feedback");
      return;
    }

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
            className="w-80 h-80 mx-auto mb-6 object-contain"
          />
          
          <h1 className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'serif' }}>
            FeedBack
          </h1>
        </div>

        <Card className="p-4 bg-card shadow-md mb-6">
          <p className="text-sm text-card-foreground mb-2 font-medium">Selecione o formulário</p>
          <select
            className="w-full h-10 rounded-md bg-[hsl(var(--btn-rating))]/40 border-none text-card-foreground px-3"
            value={selectedFeedbackId ?? ""}
            onChange={(e) => setSelectedFeedbackId(e.target.value ? Number(e.target.value) : null)}
          >
            {feedbacks.length === 0 && <option value="">Carregando...</option>}
            {feedbacks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title || `Formulário #${f.id}`}
              </option>
            ))}
          </select>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loadingQuestions && (
            <Card className="p-4 bg-card shadow-md">
              <p className="text-sm text-card-foreground">Carregando perguntas...</p>
            </Card>
          )}

          {!loadingQuestions && dbQuestions.length === 0 && (
            <Card className="p-4 bg-card shadow-md">
              <p className="text-sm text-card-foreground">Nenhuma pergunta encontrada para este formulário.</p>
            </Card>
          )}

          {!loadingQuestions &&
            dbQuestions.map((q) => {
              const type = (q.question_type ?? 0) as number;
              return (
                <Card key={q.id} className="p-4 bg-card shadow-md">
                  <p className="text-sm text-card-foreground mb-3 font-medium">
                    {q.question_text || `Pergunta #${q.id}`}
                  </p>

                  {type === 1 ? (
                    <>
                      <div className="flex justify-between gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingClick(q.id, rating)}
                            className={`flex-1 h-12 rounded-lg font-bold text-lg transition-all ${
                              answers[q.id]?.satisfaction === rating
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
                    </>
                  ) : (
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={answers[q.id]?.answer_text ?? ""}
                      onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                      className="min-h-[80px] resize-none bg-[hsl(var(--btn-rating))]/40 border-none text-card-foreground placeholder:text-card-foreground/50"
                    />
                  )}
                </Card>
              );
            })}

          {dbQuestions.length > 0 && (
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E0A938] hover:bg-[#c99430] text-white text-lg h-12 rounded-lg shadow-lg font-medium disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Feedback;
