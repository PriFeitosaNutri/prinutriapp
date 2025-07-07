import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const PostForm = ({
  showNewPostForm,
  newPost,
  setNewPost,
  selectedCategory,
  setSelectedCategory,
  categories,
  isAdmin,
  onCreatePost,
  onCancel,
  fileInputRef,
  selectedFile,
  onFileChange,
  onRemoveFile,
  isProcessing
}) => {
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview('video');
      }
    } else {
      setFilePreview(null);
    }
    
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [selectedFile]);

  return (
    <AnimatePresence>
      {showNewPostForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Nova Publicação</CardTitle>
              <CardDescription>
                Compartilhe suas experiências, dicas ou peça apoio da comunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    disabled={isProcessing}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
              
              <Textarea
                placeholder="O que você gostaria de compartilhar com a comunidade?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
                disabled={isProcessing}
              />
              
              {filePreview && (
                <div className="p-3 bg-muted rounded-lg relative">
                   <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={onRemoveFile}
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  {filePreview === 'video' ? (
                     <div className="text-sm font-medium">🎥 Vídeo selecionado: {selectedFile.name}</div>
                  ) : (
                    <img src={filePreview} alt="Preview" className="max-h-40 rounded-md" />
                  )}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
                accept={isAdmin ? "image/*,video/mp4" : "image/*"}
                disabled={isProcessing}
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center"
                  disabled={isProcessing}
                >
                  {isAdmin ? <Camera className="w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  {isAdmin ? 'Mídia' : 'Imagem'}
                </Button>
                
                <div className="flex gap-2 flex-1">
                  <Button onClick={onCreatePost} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Publicar
                  </Button>
                  <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostForm;