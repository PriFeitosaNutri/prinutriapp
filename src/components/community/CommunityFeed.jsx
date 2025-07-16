import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostForm from '@/components/community/PostForm';
import PostCard from '@/components/community/PostCard';
import { getPosts, createPost, likePost, addComment as addCommentToDb, deletePost } from '@/lib/database';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CommunityFeed = ({ user, userPhoto, nutriPhoto, toast, isAdmin = false, filter = 'geral' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newComment, setNewComment] = useState({});
  const fileInputRef = useRef(null);
  
  const generalCategories = [
    { id: 'todos', name: 'Todos', icon: '📋' },
    { id: 'dicas', name: 'Dicas', icon: '💡' },
    { id: 'desabafos', name: 'Desabafos', icon: '💭' },
    { id: 'vitorias', name: 'Vitórias', icon: '🎉' },
    { id: 'perguntas', name: 'Perguntas', icon: '❓' },
    { id: 'apoio', name: 'Bora se apoiar?', icon: '🤝' },
    { id: 'ta_pago', name: 'Tá Pago!', icon: <Zap className="w-4 h-4" /> }
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível buscar as publicações da comunidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
    const subscription = supabase
      .channel('dcc-feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dcc_posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dcc_interactions' }, fetchPosts)
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    }
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({ title: "Escreva algo!", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    let mediaUrl = null;
    let mediaType = null;
    
    try {
      if(postFile) {
        const fileExt = postFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('community_media')
          .upload(filePath, postFile);
        
        if(uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('community_media')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
        mediaType = postFile.type.startsWith('video') ? 'video' : 'image';
      }

      const newPostData = {
        user_id: user.id,
        content: newPostContent,
        category: selectedCategory === 'todos' ? 'dicas' : selectedCategory,
        media_url: mediaUrl,
        media_type: mediaType,
        is_ta_pago: selectedCategory === 'ta_pago'
      };
      
      await createPost(newPostData);
      
      setNewPostContent('');
      setPostFile(null);
      setShowNewPostForm(false);
      
      toast({ title: "Post Publicado! 🎉", className: "bg-primary text-primary-foreground" });
    } catch (error) {
      toast({ title: "Erro ao Publicar", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setIsProcessing(true);
    try {
      await deletePost(postId);
      toast({ title: "Postagem removida com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao remover postagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await likePost(postId, user.id);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível curtir o post.", variant: "destructive" });
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComment[postId];
    if (!content?.trim()) return;

    try {
      const commentData = {
        post_id: postId,
        user_id: user.id,
        interaction_type: 'comment',
        content: content
      };
      await addCommentToDb(commentData);
      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar o comentário.", variant: "destructive" });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'ta_pago') return post.is_ta_pago;
    if (filter === 'geral') {
       if (selectedCategory === 'todos') return !post.is_ta_pago;
       return post.category === selectedCategory && !post.is_ta_pago;
    }
    return true;
  });
    
  const getAuthorAvatar = (post) => {
    if (post.profiles?.is_admin) {
      return nutriPhoto;
    }
    return post.profiles?.photo_url || userPhoto;
  };

  return (
    <div className="space-y-6">
      {filter === 'geral' && (
         <div className="flex flex-wrap gap-2">
            {generalCategories.filter(c => c.id !== 'ta_pago').map(category => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-1"
                >
                    <span>{category.icon}</span>
                    {category.name}
                </Button>
            ))}
        </div>
      )}

      <PostForm
        content={newPostContent}
        setContent={setNewPostContent}
        category={selectedCategory}
        setCategory={setSelectedCategory}
        categories={generalCategories}
        onSubmit={handleCreatePost}
        isProcessing={isProcessing}
        postFile={postFile}
        setPostFile={setPostFile}
        isAdmin={isAdmin}
        isSubForm={true}
      />

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando posts...</p>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Ainda não há posts aqui. Seja a primeira a compartilhar!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              categories={generalCategories}
              user={user}
              isAdmin={isAdmin}
              getAuthorAvatar={getAuthorAvatar}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              newComment={newComment}
              setNewComment={setNewComment}
            />
          ))
        )}
      </div>

      {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
      )}
    </div>
  );
};

export default CommunityFeed;