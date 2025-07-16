import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileText, Download, User, Pill, Heart, Ruler, 
  Calculator, Scale, TrendingUp, Activity, Target, Save
} from 'lucide-react';

const PatientRecordCard = ({ 
  patientDetails, 
  patientRecord, 
  progressNotes, 
  setProgressNotes, 
  crnNumber, 
  setCrnNumber, 
  handleSaveRecord,
  handleExportPDF 
}) => {
  // Corrigindo o acesso aos dados da anamnese
  const anamnesis = Array.isArray(patientDetails?.anamnesis_forms) 
    ? patientDetails.anamnesis_forms[0] 
    : patientDetails?.anamnesis_forms;
  const metrics = patientRecord?.calculated_metrics;

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardTitle className="text-2xl flex items-center">
          <FileText className="mr-3 w-6 h-6" />
          Prontuário da Paciente - {patientDetails.name}
        </CardTitle>
        <CardDescription className="text-primary-foreground/90">
          {patientDetails.email} {patientDetails.whatsapp && `| WhatsApp: ${patientDetails.whatsapp}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                <User className="mr-2 w-5 h-5" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Idade:</strong> {anamnesis?.age || 'N/A'} anos</div>
                <div><strong>Peso Atual:</strong> {anamnesis?.weight || 'N/A'} kg</div>
                <div><strong>Altura:</strong> {anamnesis?.height || 'N/A'} cm</div>
                <div><strong>Meta de Peso:</strong> {anamnesis?.weight_loss_goal || 'N/A'} kg</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                <Ruler className="mr-2 w-5 h-5" />
                Medidas Corporais
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Quadril:</strong> {anamnesis?.hip || 'N/A'} cm</div>
                <div><strong>Braço:</strong> {anamnesis?.arm || 'N/A'} cm</div>
                <div><strong>Coxa:</strong> {anamnesis?.thigh || 'N/A'} cm</div>
                <div><strong>Cintura:</strong> {anamnesis?.waist || 'N/A'} cm</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                <Pill className="mr-2 w-5 h-5" />
                Medicamentos
              </h3>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {anamnesis?.medications || 'Nenhum medicamento informado'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                <Heart className="mr-2 w-5 h-5" />
                Condições Médicas
              </h3>
              <div className="text-sm bg-muted p-3 rounded-lg">
                {anamnesis?.medical_conditions && anamnesis.medical_conditions.length > 0 
                  ? anamnesis.medical_conditions.join(', ')
                  : 'Nenhuma condição médica informada'
                }
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Alergias</h3>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {anamnesis?.allergies || 'Nenhuma alergia informada'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Objetivos</h3>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {anamnesis?.goals || 'Objetivos não informados'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                <Calculator className="mr-2 w-5 h-5" />
                Métricas Calculadas Automaticamente
              </h3>
              {metrics ? (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Scale className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-semibold">IMC:</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{metrics.imc}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{metrics.imc_classification}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        <span className="font-semibold">TMB:</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{metrics.tmb} kcal</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Taxa Metabólica Basal</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-600" />
                        <span className="font-semibold">GET:</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">{metrics.get} kcal</span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">Gasto Energético Total</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-orange-600" />
                        <span className="font-semibold">Meta Calórica:</span>
                      </div>
                      <span className="text-xl font-bold text-orange-600">{metrics.target_calories} kcal</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">Com déficit de {metrics.deficit_calories} kcal</p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Calculado automaticamente em: {new Date(metrics.calculated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">Métricas serão calculadas automaticamente quando a anamnese for preenchida.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Progresso da Paciente</h3>
              <Textarea
                placeholder="Registre aqui o progresso, observações e evolução da paciente..."
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Número do CRN</h3>
              <Input
                placeholder="Ex: CRN-1 12345"
                value={crnNumber}
                onChange={(e) => setCrnNumber(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSaveRecord} className="flex-1 bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Salvar Prontuário
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientRecordCard;