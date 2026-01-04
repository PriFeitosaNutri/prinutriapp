import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, User, Send, Trash2, Flag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PostCard = ({
  post,
  categories,
  user,
  isAdmin,
  getAuthorAvatar,
  onLikePost,
  onAddComment,
  onDeletePost,
  newComment,
  setNewComment
}) => {
  const renderMediaContent = (post) => {
    if (!post.media_url) return null;

    if (post.media_type === 'video') {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <video 
            controls 
            className="w-full max-h-96 object-cover bg-black"
          >
            <source src={post.media_url} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        </div>
      );
    } else {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img 
            src={post.media_url} 
            alt="Imagem do post" 
            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(post.media_url, '_blank')}
          />
        </div>
      );
    }
  };

  const likes = post.dcc_interactions?.filter(i => i.interaction_type === 'like') || [];
  const comments = post.dcc_interactions?.filter(i => i.interaction_type === 'comment') || [];
  const hasLiked = likes.some(like => like.user_id === user.id);

  const handleReport = async () => {
    const reason = window.prompt("Por que você deseja denunciar esta postagem?");
    if (!reason) return;

    try {
      const { error } = await supabase.from('dcc_violations').insert({
        post_id: post.id,
        user_id: user.id,
        reason: reason,
        post_content: post.content,
        user_name: user.name
      });

      if (error) throw error;
      alert("Denúncia enviada com sucesso. A nutricionista irá analisar.");
    } catch (error) {
      console.error("Erro ao denunciar:", error);
      alert("Erro ao enviar denúncia.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                {getAuthorAvatar(post) ? (
                  <img src={getAuthorAvatar(post)} alt={post.profiles?.name || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="font-semibold">{post.profiles?.name || 'Usuário'}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.name}
              </Badge>
              {!isAdmin && (
                <Button variant="ghost" size="icon" onClick={handleReport} className="text-muted-foreground hover:text-destructive h-8 w-8" title="Denunciar postagem">
                  <Flag className="w-4 h-4" />
                </Button>
              )}
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Apagar Postagem?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A postagem e qualquer mídia associada serão permanentemente removidas.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">Apagar</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
          
          {renderMediaContent(post)}
          
          <div className="flex items-center gap-4 mt-4 -mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikePost(post.id)}
              className={`${hasLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
              {likes.length}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MessageCircle className="w-4 h-4 mr-1" />
              {comments.length}
            </Button>
          </div>

          <div className="border-t my-4"></div>

          {comments.length > 0 && (
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {comment.profiles?.photo_url ? (
                      <img src={comment.profiles.photo_url} alt={comment.profiles.name} className="w-full h-full object-cover" />
                    ) : (
                      comment.profiles?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 bg-muted/50 p-2 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">{comment.profiles?.name || 'Usuário'}</span>
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {getAuthorAvatar({profiles: user, ...post}) ? (
                    <img src={getAuthorAvatar({profiles: user, ...post})} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-5 h-5" />
                )}
            </div>
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment[post.id] || ''}
              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
              className="flex-1 min-h-[40px] max-h-24"
              rows="1"
            />
            <Button 
              size="icon" 
              onClick={() => onAddComment(post.id)}
              disabled={!newComment[post.id]?.trim()}
              className="h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;