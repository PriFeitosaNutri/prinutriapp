import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, MessageSquare, Send, Filter, Flag, Users, X } from 'lucide-react';

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-primary">
        <Filter className="w-5 h-5 mr-2" />
        Categorias
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={selectedCategory === category.id ? "bg-primary" : ""}
          >
            {category.emoji && <span className="mr-1">{category.emoji}</span>}
            {category.name}
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const NewPostButton = ({ onClick }) => (
  <Card>
    <CardContent className="p-4">
      <Button 
        onClick={onClick}
        className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white"
      >
        <Plus className="w-5 h-5 mr-2" />
        Nova Postagem
      </Button>
    </CardContent>
  </Card>
);

export const NewPostForm = ({ 
  showNewPost, 
  newPost, 
  setNewPost, 
  categories, 
  emojis, 
  onSubmit, 
  onCancel 
}) => (
  <AnimatePresence>
    {showNewPost && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Compartilhe com a Comunidade</CardTitle>
            <CardDescription>O que você gostaria de compartilhar hoje?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria:</label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map(category => (
                  <Button
                    key={category.id}
                    variant={newPost.category === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewPost({ ...newPost, category: category.id })}
                  >
                    {category.emoji} {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Textarea
              placeholder="Compartilhe seus pensamentos, dicas, vitórias ou peça apoio..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              maxLength={500}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {emojis.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewPost({ ...newPost, content: newPost.content + emoji })}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {newPost.content.length}/500
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={onSubmit} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>
);

export const PostCard = ({ 
  post, 
  categories, 
  user, 
  onLike, 
  onComment, 
  newComment, 
  setNewComment, 
  formatTimeAgo 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{post.author}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.find(c => c.id === post.category)?.emoji} {categories.find(c => c.id === post.category)?.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <img src={post.image} alt="Post image" className="w-full rounded-lg mb-4" />
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={post.likes.includes(user.email) ? "text-red-500" : ""}
          >
            <Heart className={`w-4 h-4 mr-1 ${post.likes.includes(user.email) ? 'fill-current' : ''}`} />
            {post.likes.length}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            {post.comments.length}
          </Button>
        </div>
        
        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="space-y-2 mb-4 pl-4 border-l-2 border-muted">
            {post.comments.map(comment => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold">{comment.author}</span>
                <span className="text-muted-foreground ml-2">{formatTimeAgo(comment.timestamp)}</span>
                <p className="mt-1">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Comment */}
        <div className="flex gap-2">
          <Input
            placeholder="Adicione um comentário..."
            value={newComment[post.id] || ''}
            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && onComment(post.id)}
          />
          <Button size="icon" onClick={() => onComment(post.id)}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const EmptyFeed = () => (
  <Card>
    <CardContent className="p-8 text-center text-muted-foreground">
      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-lg">Nenhuma postagem ainda nesta categoria.</p>
      <p className="text-sm">Seja a primeira a compartilhar algo!</p>
    </CardContent>
  </Card>
);