import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import PatientDetailsView from '@/components/admin/PatientDetailsView';
import PatientOverview from '@/components/admin/PatientOverview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PatientList = ({ patients: initialPatients }) => {
  const [patients, setPatients] = useState(initialPatients || []);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPatients = useCallback(async () => {
    if (initialPatients && initialPatients.length > 0) {
      setPatients(initialPatients);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: patientsData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          anamnesis_forms(*),
          appointments(*),
          patient_records(*)
        `)
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: error.message,
        variant: "destructive",
      });
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, initialPatients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleApprovePatient = async (patientId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Paciente Aprovada! ✅",
        description: "A paciente agora tem acesso completo ao app.",
        className: "bg-green-500 text-white"
      });
      loadPatients();
    } catch (error) {
      toast({
        title: "Erro ao aprovar paciente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      const { error } = await supabase.rpc('delete_user_and_data', { 
        user_id_to_delete: patientToDelete.id 
      });

      if (error) throw error;

      toast({
        title: "Paciente Deletada! 🗑️",
        description: `${patientToDelete.name} foi removida permanentemente do sistema.`,
        className: "bg-destructive text-destructive-foreground"
      });
      setSelectedPatient(null);
      loadPatients();
    } catch (error) {
      toast({
        title: "Erro ao deletar paciente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleClosePatientDetails = () => {
    setSelectedPatient(null);
    loadPatients();
  };

  if (selectedPatient) {
    return (
      <PatientDetailsView 
        patient={selectedPatient} 
        onClose={handleClosePatientDetails}
      />
    );
  }

  return (
    <>
      <PatientOverview 
        patients={patients}
        onSelectPatient={handleSelectPatient}
        onApprovePatient={handleApprovePatient}
        onDeletePatient={confirmDeletePatient}
        isLoading={isLoading}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Isso irá deletar permanentemente a paciente 
              <span className="font-bold"> {patientToDelete?.name} </span> 
              e todos os seus dados associados, incluindo anamnese, agendamentos, checklists e diários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">
              Sim, deletar paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientList;