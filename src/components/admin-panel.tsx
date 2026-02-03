'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
}

export function AdminPanel() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(uploadData.path)

        imageUrl = publicUrl
      }

      const { error } = await supabase.from('posts').insert({
        title,
        content,
        image_url: imageUrl,
      })

      if (error) throw error

      // Send email notifications
      let emailMsg = ''
      try {
        const notifyRes = await fetch('/api/admin/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postTitle: title }),
        })
        const notifyData = await notifyRes.json()
        if (notifyData.sent > 0) {
          emailMsg = ` · ${notifyData.sent} email${notifyData.sent > 1 ? 's' : ''} sent`
        } else if (notifyData.message) {
          emailMsg = ` · Emails skipped (not configured)`
        }
      } catch {
        emailMsg = ' · Email notification failed'
      }

      setTitle('')
      setContent('')
      setImageFile(null)
      setMessage({ type: 'success', text: `Post published!${emailMsg}` })
      fetchPosts()
    } catch (e) {
      console.error('Error creating post:', e)
      setMessage({ type: 'error', text: 'Failed to create post. Check database setup.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: 'Failed to delete post' })
    } else {
      setMessage({ type: 'success', text: 'Post deleted' })
      fetchPosts()
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      <Card className="border-emerald-500/20">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your update here... Markdown links like [text](url) are supported."
                rows={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            {message && (
              <div
                className={`text-sm rounded-md p-3 ${
                  message.type === 'success'
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Posts */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Existing Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{post.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </Badge>
                      {post.image_url && (
                        <Badge variant="secondary" className="text-xs">
                          Has image
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </Button>
                </div>
                <Separator className="mt-3" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
