
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, ArrowLeft, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPatientDetails, updateProfile, getPatientRecord, updatePatientRecord, calculatePatientMetrics } from '@/lib/database';
import PatientRecordCard from '@/components/admin/details/PatientRecordCard';
import ProgressCards from '@/components/admin/details/ProgressCards';
import ContentManagementCard from '@/components/admin/details/ContentManagementCard';
import ChatSection from '@/components/admin/details/ChatSection';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PatientDetailsView = ({ patient, onClose }) => {
  const [patientDetails, setPatientDetails] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [shoppingList, setShoppingList] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '' });
  const [progressNotes, setProgressNotes] = useState('');
  const [crnNumber, setCrnNumber] = useState('');
  const [editableMetrics, setEditableMetrics] = useState({ 
    imc: '', 
    tmb: '', 
    get: '', 
    deficitCalories: '' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPatientData = useCallback(async () => {
    if (!patient) return;
    setIsLoading(true);
    try {
      const details = await getPatientDetails(patient.id);
      setPatientDetails(details);
      
      const record = await getPatientRecord(patient.id);
      setPatientRecord(record);
      
      // Buscar métricas calculadas separadamente se existir anamnese
      let calculatedMetrics = null;
      if (details?.anamnesis_forms?.[0]) {
        const anamnesis = details.anamnesis_forms[0];
        if (anamnesis.weight && anamnesis.height && anamnesis.age) {
          try {
            calculatedMetrics = await calculatePatientMetrics(
              anamnesis.weight,
              anamnesis.height,
              anamnesis.age,
              anamnesis.gender || 'feminino',
              anamnesis.activity_level || 'sedentario'
            );
          } catch (error) {
            console.warn('Erro ao calcular métricas:', error);
          }
        }
      }
      
      // Adicionar métricas calculadas ao record, se existirem
      if (calculatedMetrics) {
        setPatientRecord(prevRecord => ({
          ...prevRecord,
          calculated_metrics: calculatedMetrics
        }));
      }
      
      if (details) {
        const shoppingListData = details.shopping_list;
        if (Array.isArray(shoppingListData)) {
            setShoppingList(shoppingListData.map(item => item.text || item).join("\n"));
        } else if (typeof shoppingListData === "string") {
            setShoppingList(shoppingListData);
        } else {
            setShoppingList("");
        }

        setMealPlan(details.meal_plan || "");
        setMaterials(details.materials || []); 
        setEditableMetrics({
          imc: details.manual_metrics?.imc || calculatedMetrics?.imc || "",
          tmb: details.manual_metrics?.tmb || calculatedMetrics?.tmb || "",
          get: details.manual_metrics?.get || calculatedMetrics?.get || "",
          deficitCalories: details.manual_metrics?.deficitCalories || calculatedMetrics?.deficit_calories || "",
        });
      }

      if (record) {
        setProgressNotes(record.progress_notes || "");
        setCrnNumber(record.crn_number || "");
      }
    } catch (error) {
      toast({ title: "Erro ao carregar detalhes", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [patient, toast]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleSaveContent = async () => {
    if (!patient) return;
    
    try {
      await updateProfile(patient.id, {
        shopping_list: shoppingList.split('\n').filter(item => item.trim() !== ''),
        meal_plan: mealPlan,
        manual_metrics: editableMetrics,
      });
      
      toast({ 
        title: "Conteúdo salvo!", 
        description: `As informações de ${patient.name} foram atualizadas.`, 
        className: "bg-primary text-primary-foreground", 
        duration: 3000 
      });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveRecord = async () => {
    if (!patient) return;
    
    try {
      await updatePatientRecord(patient.id, {
        progress_notes: progressNotes,
        crn_number: crnNumber,
      });
      
      toast({ 
        title: "Prontuário salvo!", 
        description: `O prontuário de ${patient.name} foi atualizado com sucesso.`, 
        className: "bg-primary text-primary-foreground", 
        duration: 3000 
      });
      
      loadPatientData();
    } catch (error) {
      toast({ title: "Erro ao salvar prontuário", description: error.message, variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('patient-record-card');
      if (!element) {
        toast({ title: "Erro", description: "Elemento não encontrado para exportação", variant: "destructive" });
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`prontuario-${patientDetails.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({ 
        title: "PDF exportado!", 
        description: "O prontuário foi exportado com sucesso.", 
        className: "bg-primary text-primary-foreground" 
      });
    } catch (error) {
      toast({ title: "Erro ao exportar PDF", description: error.message, variant: "destructive" });
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.title && newMaterial.url) {
      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      setNewMaterial({ title: '', url: '' });
    }
  };

  const handleRemoveMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
  };
  
  const renderChecklistSection = (title, icon, items) => {
    if (!items || Object.keys(items).length === 0) return <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>;
    return (
      <div className="space-y-1">
        <h4 className="font-semibold text-primary/90 flex items-center">{icon} {title}</h4>
        {Object.entries(items).map(([key, value]) => (
          <p key={key} className="text-xs">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
            <span className="font-medium">{value === null ? 'Não respondeu' : value === 'sim' ? 'Sim' : value === 'nao' ? 'Não' : String(value)}</span>
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 mr-4 animate-spin text-primary" />
          <h3 className="text-xl font-semibold">Carregando dados da paciente...</h3>
        </CardContent>
      </Card>
    );
  }

  if (!patientDetails) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Não foi possível carregar os dados.</h3>
          <p className="text-muted-foreground">Tente selecionar a paciente novamente.</p>
          <Button onClick={onClose} className="mt-4">Voltar à Lista</Button>
        </CardContent>
      </Card>
    );
  }

  const dummyDetails = {
    hydration: { 
      intake: patientDetails.daily_checklists?.reduce((total, checklist) => {
        const hydrationData = checklist.data?.hydration || checklist.data?.water_intake;
        return total + (hydrationData?.intake || hydrationData || 0);
      }, 0) || 0,
      goal: patientDetails.water_goal || 2000, 
      progress: ((patientDetails.daily_checklists?.reduce((total, checklist) => {
        const hydrationData = checklist.data?.hydration || checklist.data?.water_intake;
        return total + (hydrationData?.intake || hydrationData || 0);
      }, 0) || 0) / (patientDetails.water_goal || 2000)) * 100 
    },
    foodDiary: { 
      mealsCount: patientDetails.food_diary_entries?.length || 0, 
      lastMeals: patientDetails.food_diary_entries?.slice(-5).map(entry => ({
        time: entry.time,
        food: entry.food,
        quantity: entry.quantity,
        entry_date: entry.entry_date
      })) || [] 
    },
    checklist: { 
      completed: patientDetails.daily_checklists?.reduce((total, checklist) => {
        if (!checklist.data) return total;
        return total + Object.values(checklist.data).filter(v => v === 'sim' || v === true || v === 'Sim').length;
      }, 0) || 0,
      total: patientDetails.daily_checklists?.length * 8 || 8, 
      progress: patientDetails.daily_checklists?.length > 0 ? 
        (patientDetails.daily_checklists.reduce((total, checklist) => {
          if (!checklist.data) return total;
          return total + Object.values(checklist.data).filter(v => v === 'sim' || v === true || v === 'Sim').length;
        }, 0) / (patientDetails.daily_checklists.length * 8)) * 100 : 0,
      habits: patientDetails.daily_checklists?.flatMap(checklist => checklist.data?.habits || []) || [], 
      feeling: patientDetails.daily_checklists?.[0]?.data?.feeling || 'Não informado', 
      consciousEating: patientDetails.daily_checklists?.reduce((acc, checklist) => ({
        ...acc,
        ...checklist.data?.consciousEating
      }), {}) || {}, 
      hungerSatiety: patientDetails.daily_checklists?.reduce((acc, checklist) => ({
        ...acc,
        ...checklist.data?.hungerSatiety
      }), {}) || {}, 
      foodQuality: patientDetails.daily_checklists?.reduce((acc, checklist) => ({
        ...acc,
        ...checklist.data?.foodQuality
      }), {}) || {}, 
      planning: patientDetails.daily_checklists?.reduce((acc, checklist) => ({
        ...acc,
        ...checklist.data?.planning
      }), {}) || {},
      allChecklists: patientDetails.daily_checklists || []
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onClose} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Lista
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Detalhes - {patientDetails.name}</h1>
          <p className="text-muted-foreground">{patientDetails.email}</p>
        </div>
      </div>

      <div id="patient-record-card">
        <PatientRecordCard 
          patientDetails={patientDetails}
          patientRecord={patientRecord}
          progressNotes={progressNotes}
          setProgressNotes={setProgressNotes}
          crnNumber={crnNumber}
          setCrnNumber={setCrnNumber}
          handleSaveRecord={handleSaveRecord}
          handleExportPDF={handleExportPDF}
        />
      </div>

      <ProgressCards 
        patientDetails={dummyDetails}
        renderChecklistSection={renderChecklistSection}
      />

      <ContentManagementCard 
        shoppingList={shoppingList}
        setShoppingList={setShoppingList}
        mealPlan={mealPlan}
        setMealPlan={setMealPlan}
        materials={materials}
        newMaterial={newMaterial}
        setNewMaterial={setNewMaterial}
        handleAddMaterial={handleAddMaterial}
        handleRemoveMaterial={handleRemoveMaterial}
        handleSaveContent={handleSaveContent}
      />

      <ChatSection 
        patientDetails={patientDetails}
      />
    </div>
  );
};

export default PatientDetailsView;
