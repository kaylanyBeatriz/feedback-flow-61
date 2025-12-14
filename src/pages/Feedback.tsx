import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import vinciLogo from "@/assets/vinci-logo.png";
import { supabase } from "@/lib/supabase";

const Feedback = () => {
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

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
      // Apenas perguntas de avaliação (type === 1) são obrigatórias
      if (type === 1) {
        return !(typeof a.satisfaction === "number" && a.satisfaction > 0);
      }
      return false;
    });

    if (missing) {
      toast.error("Por favor, responda todas as perguntas de avaliação");
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

    setShowSuccessScreen(true);
  };

  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: 'serif' }}>
            Enviado com Sucesso!
          </h1>
          <p className="text-lg text-muted-foreground">
            Obrigado pelo seu feedback!
          </p>
        </div>
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
            className="w-[500px] h-[500px] mx-auto mb-6 object-contain"
          />

          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'serif' }}>
            Feedback Anônimo
          </h1>
        </div>

        <Card className="p-4 bg-card shadow-md mb-6">
          <select
            className="w-full h-10 rounded-md bg-[hsl(var(--btn-rating))]/40 border-none text-card-foreground px-3"
            value={selectedFeedbackId ?? ""}
            onChange={(e) => setSelectedFeedbackId(e.target.value ? Number(e.target.value) : null)}
            disabled
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
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingClick(q.id, rating)}
                            className={`flex-1 h-12 rounded-lg font-bold text-lg transition-all ${answers[q.id]?.satisfaction === rating
                                ? "bg-[hsl(var(--btn-rating))] text-card-foreground shadow-lg scale-105"
                                : "bg-[hsl(var(--btn-rating))]/60 text-card-foreground/70 hover:bg-[hsl(var(--btn-rating))]/80"
                              }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-[0.90rem] text-card-foreground/60">Insatisfeito</span>
                        <span className="text-[0.90rem] text-card-foreground/60">Muito satisfeito</span>
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
              className="w-full bg-[hsl(45_100%_58%)] hover:bg-[hsl(45_100%_50%)] text-[#ffffff] text-lg h-12 rounded-lg shadow-lg font-medium disabled:opacity-60"
            >
              {submitting
                ? "Enviando..."
                : <span className="font-bold">Enviar Feedback</span>
              }
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Feedback;
