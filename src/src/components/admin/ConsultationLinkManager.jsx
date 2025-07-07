import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';

const ConsultationLinkManager = ({ consultationLink, onLinkChange, onSaveLink }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ExternalLink className="w-5 h-5 mr-2 text-blue-500" />
          Link da Consulta
        </CardTitle>
        <CardDescription>
          Configure o link do Zoom que aparecerá na tela "Quase Lá" das pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Link do Zoom</label>
          <Input
            value={consultationLink}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="mt-1"
          />
        </div>
        <Button onClick={onSaveLink} className="w-full">
          <ExternalLink className="w-4 h-4 mr-2" />
          Salvar Link da Consulta
        </Button>
        {consultationLink && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Link atual:</strong> {consultationLink}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Este link aparecerá na tela "Quase Lá" das pacientes que completaram o agendamento e anamnese.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationLinkManager;