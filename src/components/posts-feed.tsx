'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
}

export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPosts(data || [])
      } catch (e) {
        console.error('Error fetching posts:', e)
        setError('Failed to load posts. Make sure the database is set up.')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/40">
            <CardHeader>
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <p className="text-amber-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No updates yet. Check back later!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.image_url}
                alt={post.title}
                className="rounded-lg w-full max-h-96 object-cover"
              />
            )}
            <Separator />
            <div className="prose prose-invert prose-sm max-w-none prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
