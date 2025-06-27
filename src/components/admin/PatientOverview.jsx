import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Trash2, Eye, Loader2, AlertTriangle } from 'lucide-react';

const PatientOverview = ({ patients, onSelectPatient, onApprovePatient, onDeletePatient, isLoading }) => {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Gerenciamento de Pacientes</CardTitle>
        <CardDescription>Aprove, visualize detalhes ou remova pacientes do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
            <p className="text-muted-foreground">Nenhuma paciente encontrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                  <TableCell>
                    {patient.is_approved ? (
                      <Badge variant="default" className="bg-green-500 text-white">Aprovada</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!patient.is_approved && (
                      <Button variant="outline" size="sm" onClick={() => onApprovePatient(patient.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => onSelectPatient(patient)}>
                      <Eye className="w-4 h-4 mr-1" /> Detalhes
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDeletePatient(patient)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientOverview;