import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Youtube, FileText, Folder, ArrowLeft, Image } from 'lucide-react';
import { motion } from 'framer-motion';

const PriNutriFlix = ({ user }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState({});

  useEffect(() => {
    const savedMaterials = localStorage.getItem(`materials_${user.email}_PriNutriApp`);
    if (savedMaterials) {
      try {
        const parsedMaterials = JSON.parse(savedMaterials);
        setMaterials(parsedMaterials);
        
        // Group materials by folder (if they have folder property) or create default categories
        const groupedFolders = {};
        parsedMaterials.forEach(material => {
          const folderName = material.folder || getDefaultFolder(material.url);
          if (!groupedFolders[folderName]) {
            groupedFolders[folderName] = [];
          }
          groupedFolders[folderName].push(material);
        });
        setFolders(groupedFolders);
      } catch (e) {
        setMaterials([]);
        setFolders({});
      }
    }
  }, [user.email]);

  const getDefaultFolder = (url) => {
    try {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'Vídeos Educativos';
      }
      if (lowerUrl.endsWith('.pdf')) {
        return 'Documentos PDF';
      }
    } catch(e) {
      // if url is not a string
    }
    return 'Outros Materiais';
  };

  const getIconForMaterial = (url) => {
    try {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return <Youtube className="w-8 h-8 text-red-500" />;
      }
      if (lowerUrl.endsWith('.pdf')) {
        return <FileText className="w-8 h-8 text-red-600" />;
      }
    } catch(e) {
      // if url is not a string
    }
    return <Play className="w-8 h-8 text-primary" />;
  };

  const getMaterialCover = (material) => {
    // Try to get a cover image for the material
    if (material.cover) {
      return material.cover;
    }
    
    // For YouTube videos, try to extract thumbnail
    if (material.url.includes('youtube.com') || material.url.includes('youtu.be')) {
      try {
        let videoId = '';
        if (material.url.includes('youtube.com/watch?v=')) {
          videoId = material.url.split('v=')[1].split('&')[0];
        } else if (material.url.includes('youtu.be/')) {
          videoId = material.url.split('youtu.be/')[1].split('?')[0];
        }
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    
    return null;
  };

  const getFolderColor = (folderName) => {
    const colors = [
      'from-red-500 to-red-700',
      'from-blue-500 to-blue-700', 
      'from-green-500 to-green-700',
      'from-purple-500 to-purple-700',
      'from-yellow-500 to-yellow-700',
      'from-pink-500 to-pink-700'
    ];
    const index = folderName.length % colors.length;
    return colors[index];
  };

  if (selectedFolder) {
    return (
      <Card className="shadow-lg bg-black text-white min-h-[600px]">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedFolder(null)}
                className="text-white hover:bg-white/20 mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <Play className="w-8 h-8 mr-3" />
                  {selectedFolder}
                </CardTitle>
                <CardDescription className="text-red-100">
                  {folders[selectedFolder]?.length || 0} materiais disponíveis
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gray-900">
          {folders[selectedFolder] && folders[selectedFolder].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders[selectedFolder].map((material, index) => {
                const coverImage = getMaterialCover(material);
                return (
                  <motion.a
                    key={index}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative overflow-hidden">
                        {coverImage ? (
                          <img 
                            src={coverImage} 
                            alt={material.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`${coverImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                          {getIconForMaterial(material.url)}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{material.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {material.url.includes('youtube') ? 'Vídeo' : material.url.endsWith('.pdf') ? 'PDF' : 'Link'}
                        </p>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum material nesta categoria ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-black text-white min-h-[600px]">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-800">
        <CardTitle className="text-3xl font-bold text-white flex items-center">
          <Play className="w-10 h-10 mr-3" />
          PriNutriFlix
        </CardTitle>
        <CardDescription className="text-red-100 text-lg">
          Seus conteúdos educativos organizados como você gosta!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-gray-900">
        {Object.keys(folders).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(folders).map(([folderName, folderMaterials], folderIndex) => (
              <div key={folderName}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Folder className="w-6 h-6 mr-2 text-yellow-500" />
                  {folderName}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {folderMaterials.slice(0, 6).map((material, index) => {
                    const coverImage = getMaterialCover(material);
                    return (
                      <motion.a
                        key={index}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (folderIndex * 0.1) + (index * 0.05) }}
                        className="group"
                      >
                        <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
                          <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative overflow-hidden">
                            {coverImage ? (
                              <img 
                                src={coverImage} 
                                alt={material.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`${coverImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                              {getIconForMaterial(material.url)}
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div className="p-2">
                            <h3 className="font-medium text-white text-xs line-clamp-2">{material.title}</h3>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                  {folderMaterials.length > 6 && (
                    <motion.button
                      onClick={() => setSelectedFolder(folderName)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (folderIndex * 0.1) + (6 * 0.05) }}
                      className="bg-gray-800 rounded-lg aspect-video flex flex-col items-center justify-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-gray-600"
                    >
                      <Folder className="w-8 h-8 text-yellow-500 mb-2" />
                      <span className="text-white text-xs font-medium">Ver Todos</span>
                      <span className="text-gray-400 text-xs">+{folderMaterials.length - 6}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/c5ffe599a2d19a5a5515ecc7db238db2.png" alt="Figurinha assistindo" className="w-24 h-24 mx-auto mb-4 opacity-80" />
            <p className="text-xl font-semibold">Bem-vinda ao PriNutriFlix!</p>
            <p className="text-sm mt-2">Sua nutricionista irá adicionar conteúdos incríveis aqui em breve!</p>
            <p className="text-xs mt-4 text-red-400">Prepare a pipoca! 🍿</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriNutriFlix;