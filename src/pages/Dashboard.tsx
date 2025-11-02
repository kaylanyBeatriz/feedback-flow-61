import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  FileText,
  LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  // Dados mockados - será substituído por dados reais do backend
  const stats = {
    totalResponses: 247,
    averageSatisfaction: 4.2,
    recommendationRate: 87,
    lastMonthGrowth: 23,
  };

  const recentFeedback = [
    {
      id: 1,
      satisfaction: "Muito Satisfeito",
      recommendation: "Definitivamente Sim",
      experience: "Excelente atendimento e produto de qualidade!",
      date: "2024-01-15",
    },
    {
      id: 2,
      satisfaction: "Satisfeito",
      recommendation: "Provavelmente Sim",
      experience: "Bom serviço, mas pode melhorar no tempo de resposta.",
      date: "2024-01-14",
    },
    {
      id: 3,
      satisfaction: "Neutro",
      recommendation: "Talvez",
      experience: "Experiência mediana, esperava mais.",
      date: "2024-01-14",
    },
  ];

  const satisfactionData = [
    { label: "Muito Satisfeito", count: 98, percentage: 40 },
    { label: "Satisfeito", count: 87, percentage: 35 },
    { label: "Neutro", count: 37, percentage: 15 },
    { label: "Insatisfeito", count: 18, percentage: 7 },
    { label: "Muito Insatisfeito", count: 7, percentage: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
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
          <Button variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalResponses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success font-medium">+{stats.lastMonthGrowth}%</span> desde o mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageSatisfaction}/5.0</div>
              <Progress value={stats.averageSatisfaction * 20} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Recomendação</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recommendationRate}%</div>
              <Progress value={stats.recommendationRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">+{stats.lastMonthGrowth}%</div>
              <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="responses">
              <MessageSquare className="w-4 h-4 mr-2" />
              Respostas
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="w-4 h-4 mr-2" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Feedbacks Recentes</CardTitle>
                <CardDescription>Últimas respostas recebidas dos usuários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <Card key={feedback.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{feedback.satisfaction}</Badge>
                          <Badge variant="outline">{feedback.recommendation}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{feedback.date}</span>
                      </div>
                      <p className="text-sm">{feedback.experience}</p>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full">
                  Ver todos os feedbacks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Distribuição de Satisfação</CardTitle>
                <CardDescription>Análise detalhada das avaliações recebidas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {satisfactionData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>Baixe relatórios completos em diferentes formatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar como CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar como PDF
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Gerenciar Questionário</CardTitle>
                <CardDescription>Configure as perguntas do formulário de feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Editar Perguntas
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações do Formulário
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>Link do Formulário</CardTitle>
                <CardDescription>Compartilhe este link para coletar feedbacks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/feedback`}
                    className="flex-1 px-3 py-2 text-sm bg-muted rounded-md"
                  />
                  <Button variant="secondary">Copiar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
