import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Search, Check, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { updateProfile } from '@/lib/database';
import { SUBSCRIPTION_PLANS, calculateSubscriptionExpiry } from '@/lib/mercadoPagoConfig';

const DirectAccessManager = ({ onClose }) => {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('solo_trimestral');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentlyGranted, setRecentlyGranted] = useState([]);

  useEffect(() => {
    loadRecentlyGranted();
  }, []);

  const loadRecentlyGranted = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, plan_type, subscription_expires_at, payment_method')
        .eq('payment_method', 'presencial')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentlyGranted(data || []);
    } catch (error) {
      console.error('Erro ao carregar acessos recentes:', error);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite o email da paciente para buscar.',
        variant: 'destructive'
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Paciente não encontrada',
          description: `Nenhuma paciente encontrada com o email: ${searchEmail}`,
          variant: 'destructive'
        });
        setFoundUser(null);
      } else {
        setFoundUser(data);
      }
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      toast({
        title: 'Erro na busca',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!foundUser) return;

    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      const expiryDate = calculateSubscriptionExpiry(selectedPlan);
      const planType = selectedPlan.includes('solo') ? 'solo' : 'acompanhado';

      await updateProfile(foundUser.id, {
        plan_type: planType,
        subscription_expires_at: expiryDate.toISOString(),
        payment_method: 'presencial',
        has_paid: true,
        has_seen_welcome: false,
        has_completed_anamnesis: false,
        has_scheduled_initial_chat: false,
        is_approved: false
      });

      toast({
        title: 'Acesso concedido! ✅',
        description: `${foundUser.name} agora tem acesso ao ${plan.name}. A paciente receberá um email de confirmação.`
      });

      setFoundUser(null);
      setSearchEmail('');
      setSelectedPlan('solo_trimestral');
      loadRecentlyGranted();
    } catch (error) {
      console.error('Erro ao conceder acesso:', error);
      toast({
        title: 'Erro ao conceder acesso',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Tem certeza que deseja revogar o acesso desta paciente?')) return;

    try {
      await updateProfile(userId, {
        has_paid: false,
        plan_type: null,
        subscription_expires_at: null,
        payment_method: null
      });

      toast({
        title: 'Acesso revogado',
        description: 'O acesso da paciente foi removido.'
      });

      loadRecentlyGranted();
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      toast({
        title: 'Erro ao revogar acesso',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Acesso Direto (Pagamento Presencial)</CardTitle>
            <CardDescription>Libere acesso para pacientes que pagaram presencialmente</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="grant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grant">Conceder Acesso</TabsTrigger>
              <TabsTrigger value="recent">Acessos Recentes</TabsTrigger>
            </TabsList>

            {/* Aba: Conceder Acesso */}
            <TabsContent value="grant" className="space-y-4">
              <form onSubmit={handleSearchUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email da Paciente</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="paciente@email.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      disabled={isSearching || isProcessing}
                    />
                    <Button
                      type="submit"
                      disabled={isSearching || isProcessing}
                      className="px-4"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {foundUser && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <div>
                    <h3 className="font-semibold text-foreground">{foundUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                  </div>

                  <div>
                    <Label htmlFor="plan">Selecione o Plano</Label>
                    <select
                      id="plan"
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      disabled={isProcessing}
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background text-foreground"
                    >
                      <optgroup label="Plano Solo">
                        <option value="solo_mensal">Solo - Mensal (R$ 27,00)</option>
                        <option value="solo_trimestral">Solo - Trimestral (R$ 67,00) ⭐</option>
                        <option value="solo_semestral">Solo - Semestral (R$ 117,00)</option>
                      </optgroup>
                      <optgroup label="Plano Acompanhado">
                        <option value="acompanhado_mensal">Acompanhado - Mensal (R$ 297,00)</option>
                        <option value="acompanhado_trimestral">Acompanhado - Trimestral (R$ 747,00) ⭐</option>
                        <option value="acompanhado_semestral">Acompanhado - Semestral (R$ 1.347,00)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Informações do Plano</p>
                    <p>
                      {SUBSCRIPTION_PLANS[selectedPlan].name}
                    </p>
                    <p className="text-xs mt-1">
                      Válido até: {formatDate(calculateSubscriptionExpiry(selectedPlan).toISOString())}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGrantAccess}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Conceder Acesso
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setFoundUser(null);
                        setSearchEmail('');
                      }}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Aba: Acessos Recentes */}
            <TabsContent value="recent" className="space-y-4">
              {recentlyGranted.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum acesso presencial concedido ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentlyGranted.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-3 flex items-center justify-between bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {user.plan_type === 'solo' ? 'Solo' : 'Acompanhado'}
                          </Badge>
                          {isExpired(user.subscription_expires_at) ? (
                            <Badge variant="destructive">Expirado</Badge>
                          ) : (
                            <Badge variant="secondary">
                              Até {formatDate(user.subscription_expires_at)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRevokeAccess(user.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectAccessManager;
