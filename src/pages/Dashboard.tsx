import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Star, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type AnswerItem = {
  id: number;
  created_at: string;
  satisfaction: number | null;
  answer_text: string | null;
  question?: {
    question_text: string | null;
    question_type?: number | null;
    feedback?: { title: string | null } | null;
  } | null;
};

const satisfactionLabel = (value: number | null) => {
  switch (value) {
    case 5: return "Muito Satisfeito";
    case 4: return "Satisfeito";
    case 3: return "Neutro";
    case 2: return "Insatisfeito";
    case 1: return "Muito Insatisfeito";
    default: return "Sem avaliação";
  }
};

const satisfactionBadgeClass = (value: number | null) => {
  switch (value) {
    case 5: return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case 4: return "bg-green-100 text-green-700 border-green-200";
    case 3: return "bg-amber-100 text-amber-700 border-amber-200";
    case 2: return "bg-orange-100 text-orange-700 border-orange-200";
    case 1: return "bg-rose-100 text-rose-700 border-rose-200";
    default: return "bg-muted text-muted-foreground border-transparent";
  }
};

const Dashboard = () => {
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [totalBad, setTotalBad] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [recentAnswers, setRecentAnswers] = useState<AnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState<boolean>(false);
  const [satisfactionDistribution, setSatisfactionDistribution] = useState<Record<number, number>>({});

  const loadStats = async () => {
    setLoadingStats(true);
    const totalResPromise = supabase
      .from("answers")
      .select("id", { count: "exact", head: true });

    const totalBadPromise = supabase
      .from("answers")
      .select("id", { count: "exact", head: true })
      .eq("satisfaction", 1);

    const [totalRes, badRes] = await Promise.all([totalResPromise, totalBadPromise]);

    if (totalRes.error) toast.error("Erro ao contar respostas");
    if (badRes.error) toast.error("Erro ao contar satisfação ruim");

    setTotalResponses(totalRes.count ?? 0);
    setTotalBad(badRes.count ?? 0);
    setLoadingStats(false);
  };

  const loadRecentAnswers = async () => {
    setLoadingAnswers(true);
    const { data, error } = await supabase
      .from("answers")
      .select("id, created_at, satisfaction, answer_text, questions:question_id(question_text, question_type, feedbacks:feedback_id(title))")
      .order("id", { ascending: false })
      .limit(10);

    if (error) {
      toast.error("Erro ao carregar respostas recentes");
    } else {
      const normalized: AnswerItem[] = (data ?? []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        satisfaction: row.satisfaction,
        answer_text: row.answer_text,
        question: {
          question_text: row.questions?.question_text ?? null,
          question_type: row.questions?.question_type ?? null,
          feedback: { title: row.questions?.feedbacks?.title ?? null }
        }
      }));
      setRecentAnswers(normalized);
    }
    setLoadingAnswers(false);
  };

  const loadSatisfactionDistribution = async () => {
    setLoadingStats(true);
    const { data, error } = await supabase
      .from("answers")
      .select("satisfaction")
      .not("satisfaction", "is", null);

    if (error) {
      toast.error("Erro ao carregar distribuição de satisfação");
    } else {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      (data ?? []).forEach((item: any) => {
        const s = Number(item.satisfaction);
        if (s >= 1 && s <= 5) counts[s] += 1;
      });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const distribution: Record<number, number> = {};
      [1, 2, 3, 4, 5].forEach((s) => {
        distribution[s] = total ? Math.round((counts[s] / total) * 100) : 0;
      });
      setSatisfactionDistribution(distribution);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    loadStats();
    loadRecentAnswers();
    loadSatisfactionDistribution();

    const channel = supabase
      .channel("answers-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "answers" },
        () => {
          loadStats();
          loadRecentAnswers();
          loadSatisfactionDistribution();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Admin</h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de Feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/questions-editor">Editar Perguntas</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loadingStats ? "..." : totalResponses}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de satisfação ruim</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loadingStats ? "..." : totalBad}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="responses">
              <MessageSquare className="w-4 h-4 mr-2" />
              Respostas
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Star className="w-4 h-4 mr-2" />
              Satisfação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Feedbacks Recentes</CardTitle>
                <CardDescription>Últimas 10 respostas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAnswers && <p className="text-sm text-muted-foreground">Carregando...</p>}
                {!loadingAnswers && recentAnswers.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
                )}
                {recentAnswers.map((row) => (
                  <Card key={row.id} className="border-l-4 border-l-primary/60 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 flex-wrap">
                            {row.question?.question_text && (
                              <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                                Pergunta: {row.question.question_text}
                              </Badge>
                            )}
                            {row.question?.feedback?.title && (
                              <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                                Formulário: {row.question.feedback.title}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {row.question?.question_type === 1 && typeof row.satisfaction === "number" ? (
                        <div
                          className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${satisfactionBadgeClass(
                            row.satisfaction
                          )}`}
                        >
                          {satisfactionLabel(row.satisfaction)}
                        </div>
                      ) : (
                        row.answer_text && (
                          <p className="text-sm bg-muted/40 rounded-md px-3 py-2 leading-relaxed">
                            {row.answer_text}
                          </p>
                        )
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={loadRecentAnswers}>
                  Atualizar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Distribuição</CardTitle>
                <CardDescription>Baseado em dados reais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[5, 4, 3, 2, 1].map((v) => {
                  const pct = satisfactionDistribution[v] || 0;
                  return (
                    <div key={v} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{satisfactionLabel(v)}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;