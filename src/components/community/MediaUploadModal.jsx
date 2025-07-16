import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';

const MediaUploadModal = ({
  showMediaUpload,
  mediaUrl,
  setMediaUrl,
  mediaType,
  setMediaType,
  isAdmin,
  onAddMedia,
  onClose
}) => {
  return (
    <AnimatePresence>
      {showMediaUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {isAdmin ? 'Adicionar Mídia' : 'Adicionar Imagem'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant={mediaType === 'image' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaType('image')}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Foto
                  </Button>
                  <Button
                    variant={mediaType === 'video' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaType('video')}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Vídeo
                  </Button>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  URL da {isAdmin && mediaType === 'video' ? 'Vídeo' : 'Imagem'}:
                </label>
                <Input
                  placeholder={`https://exemplo.com/${isAdmin && mediaType === 'video' ? 'video.mp4' : 'imagem.jpg'}`}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onAddMedia()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole aqui o link da sua {isAdmin && mediaType === 'video' ? 'vídeo' : 'imagem'}.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={onAddMedia} 
                  className="flex-1"
                  disabled={!mediaUrl.trim()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaUploadModal;