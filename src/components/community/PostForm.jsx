
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Image as ImageIcon, X, Loader2, Send } from 'lucide-react';

const PostForm = ({
  content,
  setContent,
  category,
  setCategory,
  categories,
  onSubmit,
  isProcessing,
  postFile,
  setPostFile,
  isAdmin,
  isSubForm = false
}) => {
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let objectUrl = null;
    if (postFile) {
      if (postFile.type.startsWith('image/')) {
        objectUrl = URL.createObjectURL(postFile);
        setFilePreview(objectUrl);
      } else {
        setFilePreview('video');
      }
    } else {
      setFilePreview(null);
    }
    
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [postFile]);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPostFile(e.target.files[0]);
    }
  };

  const onRemoveFile = () => {
    setPostFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {!isSubForm && (
         <div className="flex flex-wrap gap-2">
            {categories.slice(1).map(cat => (
              (cat.id !== 'ta_pago') && (
                <Button
                    key={cat.id}
                    variant={category === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat.id)}
                    disabled={isProcessing}
                >
                    {cat.icon} {cat.name}
                </Button>
              )
            ))}
        </div>
      )}
      
      {!isSubForm && (
          <Textarea
            placeholder="O que você gostaria de compartilhar com a comunidade?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            disabled={isProcessing}
          />
      )}
      
      {filePreview && (
        <div className="p-3 bg-muted rounded-lg relative">
           <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-1 right-1 w-6 h-6 z-10"
              onClick={onRemoveFile}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          {filePreview === 'video' ? (
             <div className="text-sm font-medium">🎥 Vídeo selecionado: {postFile.name}</div>
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
          <Button onClick={onSubmit} className="flex-1" disabled={isProcessing || !content?.trim()}>
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
