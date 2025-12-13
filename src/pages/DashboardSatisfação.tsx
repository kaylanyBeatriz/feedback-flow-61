import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Star, LogOut, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const DashboardSatisfaction = () => {
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [recentAnswers, setRecentAnswers] = useState<AnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState<boolean>(false);
  const [satisfactionDistribution, setSatisfactionDistribution] = useState<Record<number, number>>({});
  // Filtros de data
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Filtro de satisfação (somente 5 opções, sem “Todos”)
  const [satisfactionFilter, setSatisfactionFilter] = useState<string>("5");
  // Paginação
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [answersTotal, setAnswersTotal] = useState<number>(0);

  const applyDateFilters = <T extends ReturnType<typeof supabase.from>["select"]>(query: any) => {
    if (startDate) query = query.gte("created_at", new Date(startDate).toISOString());
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDateTime.toISOString());
    }
    return query;
  };

  const loadStats = async () => {
    setLoadingStats(true);
    let totalResQuery = supabase
      .from("answers")
      .select("id", { count: "exact", head: true })
      .not("satisfaction", "is", null)
      .eq("satisfaction", parseInt(satisfactionFilter));

    totalResQuery = applyDateFilters(totalResQuery);

    const totalRes = await totalResQuery;
    if (totalRes.error) toast.error("Erro ao contar respostas");
    setTotalResponses(totalRes.count ?? 0);
    setLoadingStats(false);
  };

  const loadRecentAnswers = async () => {
    setLoadingAnswers(true);

    // contagem com satisfaction filtrada
    let countQuery = supabase
      .from("answers")
      .select("id", { count: "exact", head: true })
      .not("satisfaction", "is", null)
      .eq("satisfaction", parseInt(satisfactionFilter));

    countQuery = applyDateFilters(countQuery);

    const countRes = await countQuery;
    if (countRes.error) {
      toast.error("Erro ao contar respostas");
      setAnswersTotal(0);
    } else {
      setAnswersTotal(countRes.count ?? 0);
    }

    // paginação com satisfaction filtrada
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("answers")
      .select("id, created_at, satisfaction, answer_text, questions:question_id(question_text, question_type, feedbacks:feedback_id(title))")
      .order("id", { ascending: false })
      .range(from, to)
      .not("satisfaction", "is", null)
      .eq("satisfaction", parseInt(satisfactionFilter));

    query = applyDateFilters(query);

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao carregar respostas");
      setRecentAnswers([]);
    } else {
      const normalized: AnswerItem[] = (data ?? []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        satisfaction: row.satisfaction,
        answer_text: row.answer_text,
        question: {
          question_text: row.questions?.question_text ?? null,
          question_type: row.questions?.question_type ?? null,
          feedback: { title: row.questions?.feedbacks?.title ?? null },
        },
      }));
      setRecentAnswers(normalized);
    }
    setLoadingAnswers(false);
  };

  const loadSatisfactionDistribution = async () => {
    setLoadingStats(true);
    // distribuição também respeita o filtro de data, mas não filtra pelo valor específico para mostrar a proporção geral do período
    let query = supabase
      .from("answers")
      .select("satisfaction")
      .not("satisfaction", "is", null);

    query = applyDateFilters(query);

    const { data, error } = await query;
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
  }, [startDate, endDate, page, satisfactionFilter]);

  useEffect(() => {
    const channel = supabase
      .channel("answers-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers" }, () => {
        loadStats();
        loadRecentAnswers();
        loadSatisfactionDistribution();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    setSatisfactionFilter("5");
  };

  const hasActiveFilters = startDate || endDate || satisfactionFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Satisfação</h1>
              <p className="text-sm text-muted-foreground">Somente respostas com satisfação</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">Dashboard Geral</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/questions-editor">Editar Perguntas</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-lg border bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Respostas
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{loadingStats ? "..." : totalResponses}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border bg-card/80 backdrop-blur-sm mb-4 sm:mb-6 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <CardTitle>Filtros</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satisfaction-filter">Satisfação</Label>
                <Select value={satisfactionFilter} onValueChange={setSatisfactionFilter}>
                  <SelectTrigger id="satisfaction-filter" className="bg-background/60 h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">{satisfactionLabel(5)}</SelectItem>
                    <SelectItem value="4">{satisfactionLabel(4)}</SelectItem>
                    <SelectItem value="3">{satisfactionLabel(3)}</SelectItem>
                    <SelectItem value="2">{satisfactionLabel(2)}</SelectItem>
                    <SelectItem value="1">{satisfactionLabel(1)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto bg-muted/30 rounded-lg p-1">
            <TabsTrigger
              value="responses"
              className="
        rounded-md px-3 py-2
        text-foreground
        hover:bg-muted/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
        data-[state=active]:bg-card
        data-[state=active]:text-primary
        data-[state=active]:border data-[state=active]:border-primary/30
        data-[state=active]:shadow-sm
        transition-colors
      "
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Respostas
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="
        rounded-md px-3 py-2
        text-foreground
        hover:bg-muted/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
        data-[state=active]:bg-card
        data-[state=active]:text-primary
        data-[state=active]:border data-[state=active]:border-primary/30
        data-[state=active]:shadow-sm
        transition-colors
      "
            >
              <Star className="w-4 h-4 mr-2" />
              Satisfação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-4">
            <Card className="shadow-lg border bg-gradient-card rounded-xl">
              <CardHeader>
                <CardTitle>Respostas com satisfação</CardTitle>
                <CardDescription>
                  Página {page} • até {pageSize} por página • total {answersTotal}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAnswers && (
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-muted/50 rounded-md animate-pulse" />
                    <div className="h-20 w-full bg-muted/40 rounded-md animate-pulse" />
                    <div className="h-20 w-full bg-muted/40 rounded-md animate-pulse" />
                  </div>
                )}
                {!loadingAnswers && recentAnswers.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma resposta no período.</p>
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

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1 || loadingAnswers}
                  >
                    Página anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {answersTotal > 0
                      ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, answersTotal)} de ${answersTotal}`
                      : "0 de 0"}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const maxPage = Math.max(Math.ceil(answersTotal / pageSize), 1);
                      setPage((p) => Math.min(p + 1, maxPage));
                    }}
                    disabled={page >= Math.ceil(answersTotal / pageSize) || loadingAnswers}
                  >
                    Próxima página
                  </Button>
                </div>

                <Button variant="outline" className="w-full" onClick={loadRecentAnswers} disabled={loadingAnswers}>
                  Atualizar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="shadow-lg border bg-gradient-to-br from-card to-muted/30 rounded-xl">
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
                      <Progress value={pct} className="h-2 rounded-full" />
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

export default DashboardSatisfaction;