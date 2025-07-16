import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollText, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-accent text-primary-foreground p-6">
            <CardTitle className="text-3xl font-bold flex items-center justify-center">
              <ScrollText className="mr-3 w-8 h-8" />
              Política de Privacidade - PriNutriApp
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Seu bem-estar e a segurança dos seus dados são nossa prioridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">1. Coleta de Dados</h2>
              <p className="text-muted-foreground">
                O PriNutriApp coleta informações que você nos fornece diretamente ao preencher a anamnese, 
                registrar suas refeições, hidratação e checklist diário. Isso inclui dados como nome, e-mail, 
                idade, peso, altura, metas de saúde, histórico médico relevante, hábitos alimentares e de vida.
                Todos os dados são armazenados localmente no seu dispositivo (usando o LocalStorage do navegador)
                e não são transmitidos para servidores externos sem sua interação direta (como ao enviar mensagens para a nutri).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">2. Uso dos Dados</h2>
              <p className="text-muted-foreground">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Permitir que sua nutricionista personalize seu plano alimentar e acompanhamento.</li>
                <li>Possibilitar o monitoramento do seu progresso (peso, hidratação, hábitos).</li>
                <li>Facilitar a comunicação entre você e sua nutricionista através do chat integrado.</li>
                <li>Oferecer funcionalidades de gamificação para motivar o alcance dos seus objetivos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">3. Armazenamento e Segurança</h2>
              <p className="text-muted-foreground">
                O PriNutriApp prioriza a segurança dos seus dados. Como mencionado, as informações são armazenadas 
                localmente no seu navegador. Isso significa que os dados residem no seu dispositivo e não em um servidor central 
                para a funcionalidade principal do app. A nutricionista tem acesso aos seus dados através de um painel administrativo
                que lê essas informações do LocalStorage quando você está online, para fins de acompanhamento.
                Recomendamos que você utilize senhas fortes e mantenha seu dispositivo seguro.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground">
                Nós não compartilhamos seus dados pessoais com terceiros, exceto com sua nutricionista designada 
                para o seu acompanhamento dentro do PriNutriApp. Seus dados não são vendidos ou utilizados para fins 
                de publicidade direcionada por terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">5. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Acessar seus dados a qualquer momento através do aplicativo.</li>
                <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos. (Como os dados são locais, você pode limpá-los no seu navegador, ou solicitar à nutri).</li>
                <li>Revogar o consentimento a qualquer momento (o que pode implicar na impossibilidade de uso do app).</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para exercer seus direitos, entre em contato com sua nutricionista.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">6. Cookies e Tecnologias Semelhantes</h2>
              <p className="text-muted-foreground">
                O PriNutriApp utiliza o LocalStorage do navegador para armazenar seus dados e preferências,
                o que é essencial para o funcionamento do aplicativo offline e para manter seu estado entre as sessões.
                Não utilizamos cookies de rastreamento de terceiros para publicidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">7. Alterações na Política de Privacidade</h2>
              <p className="text-muted-foreground">
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos sobre quaisquer 
                alterações significativas através do aplicativo ou por e-mail. Recomendamos que você revise 
                esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">8. Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, 
                entre em contato com sua nutricionista através do chat no aplicativo ou pelo e-mail de suporte fornecido por ela.
              </p>
            </section>

            <p className="text-xs text-muted-foreground text-center pt-4">Última atualização: 16 de Junho de 2025</p>

            <Button onClick={onClose} className="w-full mt-6 bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao App
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;