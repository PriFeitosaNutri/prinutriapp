import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, TrendingUp, Scale, Zap, Target, Users, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { calculatePatientMetrics, getAllPatients, updatePatientRecord } from '@/lib/database';

const NutritionalCalculators = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [activityLevel, setActivityLevel] = useState('sedentario');
  const [deficitCalories, setDeficitCalories] = useState('');

  const [tmb, setTmb] = useState(null);
  const [get, setGet] = useState(null);
  const [targetCalories, setTargetCalories] = useState(null);
  const [imc, setImc] = useState(null);
  const [imcClassification, setImcClassification] = useState('');
  const [imcColor, setImcColor] = useState('text-foreground');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);
  
  const { toast } = useToast();

  const calculateMifflin = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0 || a <= 0) {
      toast({ 
        title: "Entrada Inválida", 
        description: "Por favor, insira valores válidos para peso, altura e idade.", 
        variant: "destructive" 
      });
      return;
    }

    setIsCalculating(true);
    try {
      const metrics = await calculatePatientMetrics(w, h, a, gender === 'male' ? 'masculino' : 'feminino', activityLevel);
      
      if (metrics.error) {
        toast({ 
          title: "Erro no cálculo", 
          description: metrics.error, 
          variant: "destructive" 
        });
        return;
      }

      setImc(metrics.imc);
      setImcClassification(metrics.imc_classification);
      setTmb(metrics.tmb);
      setGet(metrics.get);
      setTargetCalories(metrics.target_calories);

      let color = 'text-foreground';
      if (metrics.imc < 18.5) {
        color = 'text-blue-500';
      } else if (metrics.imc < 25) {
        color = 'text-green-500';
      } else if (metrics.imc < 30) {
        color = 'text-yellow-500';
      } else if (metrics.imc < 35) {
        color = 'text-red-500';
      } else if (metrics.imc < 40) {
        color = 'text-red-600';
      } else {
        color = 'text-red-700';
      }
      setImcColor(color);

      toast({ 
        title: "Cálculo realizado!", 
        description: "Métricas calculadas com sucesso usando a fórmula Mifflin-St. Jeor.", 
        className: "bg-primary text-primary-foreground" 
      });
    } catch (error) {
      toast({ 
        title: "Erro no cálculo", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const recalculateAllPatients = async () => {
    setIsRecalculatingAll(true);
    try {
      const patients = await getAllPatients();
      let successCount = 0;
      let errorCount = 0;

      for (const patient of patients) {
        try {
          const anamnesis = patient.anamnesis_forms?.[0];
          if (anamnesis && anamnesis.weight && anamnesis.height && anamnesis.age) {
            const activityLevelMapping = {
              'sedentário': 'sedentario',
              'sedentario': 'sedentario',
              'leve': 'leve',
              'moderado': 'moderado',
              'intenso': 'intenso',
              'muito intenso': 'muito_intenso'
            };

            const mappedActivityLevel = activityLevelMapping[anamnesis.activity_level?.toLowerCase()] || 'sedentario';

            const metrics = await calculatePatientMetrics(
              anamnesis.weight,
              anamnesis.height,
              anamnesis.age,
              'feminino',
              mappedActivityLevel
            );

            if (!metrics.error) {
              await updatePatientRecord(patient.id, {
                calculated_metrics: metrics
              });
              successCount++;
            } else {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Erro ao calcular métricas para paciente ${patient.name}:`, error);
          errorCount++;
        }
      }

      toast({ 
        title: "Recálculo concluído!", 
        description: `${successCount} pacientes atualizadas com sucesso. ${errorCount > 0 ? `${errorCount} erros encontrados.` : ''}`, 
        className: "bg-primary text-primary-foreground",
        duration: 5000
      });
    } catch (error) {
      toast({ 
        title: "Erro no recálculo", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  const activityLevels = [
    { value: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)' },
    { value: 'leve', label: 'Levemente ativo (exercício leve 1-3 dias/semana)' },
    { value: 'moderado', label: 'Moderadamente ativo (exercício moderado 3-5 dias/semana)' },
    { value: 'intenso', label: 'Muito ativo (exercício pesado 6-7 dias/semana)' },
    { value: 'muito_intenso', label: 'Extremamente ativo (exercício muito pesado e trabalho físico)' },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardTitle className="text-2xl flex items-center">
            <Calculator className="mr-2"/>
            Calculadora Automática de Métricas Nutricionais
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Sistema integrado que calcula automaticamente IMC, TMB, GET e déficit calórico usando dados da anamnese.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
              <Database className="mr-2 w-5 h-5" />
              Sistema Automático Ativo
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              As métricas são calculadas automaticamente quando uma paciente preenche a anamnese. 
              Os dados são salvos no prontuário e podem ser visualizados na seção de detalhes da paciente.
            </p>
            <Button 
              onClick={recalculateAllPatients} 
              disabled={isRecalculatingAll}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Users className="mr-2 w-4 h-4" />
              {isRecalculatingAll ? 'Recalculando...' : 'Recalcular Todas as Pacientes'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Calculadora Manual</h3>
              <div>
                <Label htmlFor="weight-tmb">Peso (kg)</Label>
                <Input 
                  id="weight-tmb" 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Ex: 60.5" 
                />
              </div>
              <div>
                <Label htmlFor="height-tmb">Altura (cm)</Label>
                <Input 
                  id="height-tmb" 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  placeholder="Ex: 165" 
                />
              </div>
              <div>
                <Label htmlFor="age-tmb">Idade (anos)</Label>
                <Input 
                  id="age-tmb" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  placeholder="Ex: 30" 
                />
              </div>
              <div>
                <Label>Gênero</Label>
                <RadioGroup defaultValue="female" value={gender} onValueChange={setGender} className="flex gap-4 mt-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Feminino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Masculino</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Nível de Atividade Física</Label>
                <RadioGroup value={activityLevel} onValueChange={setActivityLevel} className="space-y-1 mt-1">
                  {activityLevels.map(level => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={`activity-${level.value}`} />
                      <Label htmlFor={`activity-${level.value}`} className="font-normal text-sm">
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button onClick={calculateMifflin} className="w-full mt-2" disabled={isCalculating}>
                <TrendingUp className="mr-2"/>
                {isCalculating ? 'Calculando...' : 'Calcular Métricas'}
              </Button>
            </div>
            
            {(tmb && get && imc) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="space-y-4 p-6 bg-muted rounded-lg self-start"
              >
                <h3 className="text-xl font-semibold text-primary">Resultados:</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-lg">
                      <strong className="flex items-center">
                        <Scale className="w-4 h-4 mr-2" />
                        IMC:
                      </strong> 
                      <span className={`font-bold text-2xl ml-2 ${imcColor}`}>{imc}</span>
                    </p>
                    <p className={`text-sm mt-1 ${imcColor}`}>{imcClassification}</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-lg">
                      <strong>Taxa Metabólica Basal (TMB):</strong> 
                      <span className="font-bold text-green-600 ml-2">{tmb} kcal/dia</span>
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-lg">
                      <strong>Gasto Energético Total (GET):</strong> 
                      <span className="font-bold text-purple-600 ml-2">{get} kcal/dia</span>
                    </p>
                  </div>

                  {targetCalories && (
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <p className="text-lg">
                        <strong className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Calorias Alvo (com déficit):
                        </strong> 
                        <span className="font-bold text-orange-600 ml-2">{targetCalories} kcal/dia</span>
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculado usando a fórmula Mifflin-St. Jeor com déficit automático baseado no IMC.
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground">
          <CardTitle className="text-2xl flex items-center">
            <Scale className="mr-2"/>
            Calculadora de IMC Rápida
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Calcule rapidamente o Índice de Massa Corporal e veja a classificação OMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight-imc">Peso (kg)</Label>
              <Input 
                id="weight-imc" 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="Ex: 60.5" 
              />
            </div>
            <div>
              <Label htmlFor="height-imc">Altura (cm)</Label>
              <Input 
                id="height-imc" 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                placeholder="Ex: 165" 
              />
            </div>
            <Button onClick={calculateMifflin} className="w-full mt-2" disabled={isCalculating}>
              <Zap className="mr-2"/>
              {isCalculating ? 'Calculando...' : 'Calcular IMC'}
            </Button>
          </div>
          {imc && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-4 p-6 bg-muted rounded-lg self-start"
            >
              <h3 className="text-xl font-semibold text-primary">Resultado IMC:</h3>
              <p className="text-lg">
                <strong>IMC:</strong> 
                <span className={`font-bold text-2xl ml-2 ${imcColor}`}>{imc}</span>
              </p>
              <p className="text-lg">
                <strong>Classificação OMS:</strong> 
                <span className={`font-bold ml-2 ${imcColor}`}>{imcClassification}</span>
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionalCalculators;