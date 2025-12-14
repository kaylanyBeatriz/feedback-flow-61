import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Informe o e-mail.");
      return;
    }
    if (mode !== "reset" && !password) {
      toast.error("Informe a senha.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          toast.success("Login realizado com sucesso!");
          navigate("/dashboard");
        }
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              notify_admin: "vinciburguer.oficial@gmail.com",
              requested_email: email,
            }
          },
        });
        if (error) throw error;

        if (data.user) {
          // Salvar solicitação pendente
          await supabase.from('pending_users').insert({
            user_id: data.user.id,
            email: email,
            admin_email: "vinciburguer.oficial@gmail.com",
            status: 'pending',
            created_at: new Date().toISOString()
          });

          toast.info("Cadastro criado. Verificação enviada para vinciburguer.oficial@gmail.com");
          setMode("login");
        }
      }

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // Crie depois uma página para trocar a senha, se quiser.
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;

        toast.success("Enviamos um link de recuperação para seu e-mail.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Ocorreu um erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-xl">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Feedback Admin</h1>
          <p className="text-muted-foreground mt-2">Acesse o painel administrativo</p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle>
              {mode === "login" && "Login"}
              {mode === "signup" && "Criar conta"}
              {mode === "reset" && "Recuperar senha"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "Entre com suas credenciais para acessar o dashboard"}
              {mode === "signup" && "Informe seu e-mail e defina uma senha para criar a conta"}
              {mode === "reset" && "Informe seu e-mail para receber o link de recuperação"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== "reset" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processando..."
                  : mode === "login"
                  ? "Entrar"
                  : mode === "signup"
                  ? "Criar conta"
                  : "Enviar link"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === "login" && (
                <>
                  <Button
                    variant="link"
                    onClick={() => setMode("reset")}
                    className="text-sm text-muted-foreground"
                  >
                    Esqueci minha senha
                  </Button>
                  <div className="text-sm">
                    Não tem conta?{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setMode("signup")}>
                      Criar conta
                    </Button>
                  </div>
                </>
              )}

              {mode === "signup" && (
                <div className="text-sm">
                  Já tem conta?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setMode("login")}>
                    Entrar
                  </Button>
                </div>
              )}

              {mode === "reset" && (
                <div className="text-sm">
                  Lembrou a senha?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setMode("login")}>
                    Voltar ao login
                  </Button>
                </div>
              )}

              <Button
                variant="link"
                onClick={() => navigate("/feedback")}
                className="text-sm text-muted-foreground"
              >
                Acessar formulário de feedback
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sistema de Gerenciamento de Feedback</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;