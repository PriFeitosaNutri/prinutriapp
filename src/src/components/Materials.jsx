import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Youtube, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const Materials = ({ user }) => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profile_materials')
          .select('materials(*)')
          .eq('profile_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          setMaterials(data.map(item => item.materials));
        }
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [user]);

  const getIconForLink = (url) => {
    try {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
            return <Youtube className="w-5 h-5 text-red-500" />;
        }
        if (lowerUrl.endsWith('.pdf')) {
            return <FileText className="w-5 h-5 text-accent" />;
        }
    } catch(e) {
        // if url is not a string
    }
    return <Link className="w-5 h-5 text-primary" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-primary"><Link className="w-6 h-6 mr-2" />Materiais de Apoio</CardTitle>
        <CardDescription>Links, vídeos e documentos selecionados pela sua nutri.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Carregando materiais...</p> : materials.length > 0 ? (
          <div className="space-y-3">
            {materials.map((material, index) => (
              <motion.a key={material.id || index} href={material.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mr-4">{getIconForLink(material.url)}</div>
                <span className="font-medium text-foreground">{material.title}</span>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/c5ffe599a2d19a5a5515ecc7db238db2.png" alt="Figurinha assistindo vídeo" className="w-24 h-24 mx-auto mb-4 opacity-80" />
            <p className="text-lg">Nenhum material de apoio disponível.</p>
            <p className="text-sm">Sua nutricionista irá adicionar materiais aqui em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Materials;