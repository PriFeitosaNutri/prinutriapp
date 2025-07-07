import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostForm from '@/components/community/PostForm';
import PostCard from '@/components/community/PostCard';
import { getPosts, createPost, likePost, addComment as addCommentToDb, deletePost } from '@/lib/database';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const CommunityFeed = ({ user, userPhoto, nutriPhoto, toast, isAdmin = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newComment, setNewComment] = useState({});
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'todos', name: 'Todos', icon: '📋' },
    { id: 'dicas', name: 'Dicas', icon: '💡' },
    { id: 'desabafos', name: 'Desabafos', icon: '💭' },
    { id: 'vitorias', name: 'Vitórias', icon: '🎉' },
    { id: 'perguntas', name: 'Perguntas', icon: '❓' },
    { id: 'apoio', name: 'Bora se apoiar?', icon: '🤝' }
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
      };
      
      await createPost(newPostData);
      
      setNewPostContent('');
      setPostFile(null);
      setShowNewPostForm(false);
      
      toast({ title: "Post Publicado! 🎉", className: "bg-primary text-primary-foreground" });
      fetchPosts();
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
      fetchPosts();
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
      fetchPosts();
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
      fetchPosts();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar o comentário.", variant: "destructive" });
    }
  };

  const filteredPosts = selectedCategory === 'todos'
    ? posts
    : posts.filter(post => post.category === selectedCategory);
    
  const getAuthorAvatar = (post) => {
    if (post.profiles?.is_admin) {
      return nutriPhoto;
    }
    return post.profiles?.photo_url || userPhoto;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
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

      <Button 
        onClick={() => setShowNewPostForm(!showNewPostForm)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        ✨ Compartilhar com a Comunidade
      </Button>

      <PostForm
        showNewPostForm={showNewPostForm}
        newPost={newPostContent}
        setNewPost={setNewPostContent}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        isAdmin={isAdmin}
        onCreatePost={handleCreatePost}
        onCancel={() => {
          setShowNewPostForm(false);
          setPostFile(null);
        }}
        fileInputRef={fileInputRef}
        selectedFile={postFile}
        onFileChange={(e) => setPostFile(e.target.files[0])}
        onRemoveFile={() => setPostFile(null)}
        isProcessing={isProcessing}
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
              categories={categories}
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