'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

interface NavProps {
  userEmail?: string | null
  isAdmin?: boolean
}

export function Nav({ userEmail, isAdmin }: NavProps) {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/updates', label: 'Updates' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500" />
            <span className="font-bold text-lg">HYPE Tracker</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'text-sm',
                    pathname === link.href && 'bg-emerald-500/10 text-emerald-400'
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
