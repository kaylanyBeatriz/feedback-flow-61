import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type FeedbackForm = { id: number; title: string | null };
type EditableQuestion = {
  id?: number;
  question_text: string;
  question_type: number;
  isNew?: boolean;
  saving?: boolean;
};

const QuestionsEditor = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackForm[]>([]);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (data && data.length > 0 && !selectedFeedbackId) {
      setSelectedFeedbackId(data[0].id);
    }
  };

  const loadQuestions = async (formId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("id, question_text, question_type")
    
      .eq("feedback_id", formId)
      .order("id", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar perguntas");
      setQuestions([]);
    } else {
      setQuestions((data || []).map((q) => ({ id: q.id, question_text: q.question_text ?? "", question_type: Number(q.question_type) })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    if (selectedFeedbackId) loadQuestions(selectedFeedbackId);
    else setQuestions([]);
  }, [selectedFeedbackId]);

  const addQuestion = () => {
    if (!selectedFeedbackId) {
      toast.error("Selecione um formulário");
      return;
    }
    setQuestions((prev) => [
      ...prev,
      { question_text: "", question_type: 1, isNew: true, saving: false },
    ]);
  };

  const updateLocal = (idx: number, patch: Partial<EditableQuestion>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const saveQuestion = async (idx: number) => {
    const q = questions[idx];
    if (!selectedFeedbackId) {
      toast.error("Selecione um formulário");
      return;
    }
    if (!q.question_text?.trim()) {
      toast.error("O texto da pergunta é obrigatório");
      return;
    }

    updateLocal(idx, { saving: true });

    if (q.isNew) {
      const { data, error } = await supabase
        .from("questions")
        .insert({
          feedback_id: selectedFeedbackId,
          question_text: q.question_text.trim(),
          question_type: q.question_type,
        })
        .select("id")
        .single();

      updateLocal(idx, { saving: false });

      if (error) {
        toast.error("Erro ao criar pergunta");
        return;
      }
      updateLocal(idx, { id: data?.id, isNew: false });
      toast.success("Pergunta criada");
    }
  };

  const deleteQuestion = async (idx: number) => {
    const q = questions[idx];
    if (q.isNew || !q.id) {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    updateLocal(idx, { saving: true });

    const { count, error: countErr } = await supabase
      .from("answers")
      .select("id", { count: "exact", head: true })
      .eq("question_id", q.id);

    if (countErr) {
      updateLocal(idx, { saving: false });
      toast.error("Erro ao verificar respostas vinculadas");
      return;
    }

    if ((count ?? 0) > 0) {
      const proceed = window.confirm(
        `Esta pergunta possui ${count} resposta(s) vinculada(s). Deseja excluir todas as respostas e a pergunta?`
      );
      if (!proceed) {
        updateLocal(idx, { saving: false });
        return;
      }

      const { error: delAnswersErr } = await supabase
        .from("answers")
        .delete()
        .eq("question_id", q.id);

      if (delAnswersErr) {
        updateLocal(idx, { saving: false });
        toast.error("Erro ao excluir respostas vinculadas");
        return;
      }
    }

    const { error: delQuestionErr } = await supabase
      .from("questions")
      .delete()
      .eq("id", q.id);

    updateLocal(idx, { saving: false });

    if (delQuestionErr) {
      toast.error("Erro ao excluir pergunta");
      return;
    }

    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Pergunta excluída");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Perguntas</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Voltar ao Dashboard
            </Button>
            <Button onClick={addQuestion}>Adicionar Pergunta</Button>
          </div>
        </div>

        <Card className="p-4">
          <p className="text-sm mb-2 font-medium">Selecione o formulário</p>
          <select
            className="w-full h-10 rounded-md bg-muted/40 border border-border text-foreground px-3"
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

        {loading && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Carregando perguntas...</p>
          </Card>
        )}

        {!loading && selectedFeedbackId && (
          <div className="space-y-4">
            {questions.length === 0 && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Nenhuma pergunta ainda.</p>
              </Card>
            )}

            {questions.map((q, idx) => (
              <Card key={q.id ?? `new-${idx}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {q.isNew ? "Nova Pergunta" : `Pergunta #${q.id}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.isNew ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Texto da pergunta</label>
                        <input
                          type="text"
                          value={q.question_text}
                          onChange={(e) => updateLocal(idx, { question_text: e.target.value })}
                          className="w-full h-10 rounded-md bg-muted/40 border border-border px-3"
                          placeholder="Digite o texto da pergunta"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Tipo</label>
                        <select
                          value={q.question_type}
                          onChange={(e) => updateLocal(idx, { question_type: Number(e.target.value) })}
                          className="w-full h-10 rounded-md bg-muted/40 border border-border px-3"
                        >
                          <option value={1}>Escala (1 a 5)</option>
                          <option value={0}>Texto (resposta aberta)</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        {q.question_type === 1 ? (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                                title="Pré-visualização"
                              >
                                {n}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20 rounded-md bg-muted flex items-center px-3 text-sm text-muted-foreground">
                            Pré-visualização do campo de texto
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveQuestion(idx)}
                          disabled={q.saving}
                          className="disabled:opacity-60"
                        >
                          {q.saving ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteQuestion(idx)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Texto:</span> {q.question_text}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Tipo:</span>{" "}
                          {q.question_type === 1 ? "Escala (1 a 5)" : "Texto (resposta aberta)"}
                        </p>
                      </div>

                      <div className="pt-2">
                        {q.question_type === 1 ? (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                              >
                                {n}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20 rounded-md bg-muted flex items-center px-3 text-sm text-muted-foreground">
                            Pré-visualização do campo de texto
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          onClick={() => deleteQuestion(idx)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsEditor;
