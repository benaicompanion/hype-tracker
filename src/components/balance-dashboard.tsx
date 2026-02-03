'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { BalanceBreakdown } from '@/lib/hyperliquid'

function formatNumber(n: number, decimals: number = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatUsd(n: number): string {
  return '$' + formatNumber(n, 2)
}

function formatBtc(n: number): string {
  return formatNumber(n, 6) + ' BTC'
}

interface UserShare {
  sharePercentage: number
  initialInvestment: number
}

export function BalanceDashboard() {
  const [balance, setBalance] = useState<BalanceBreakdown | null>(null)
  const [userShare, setUserShare] = useState<UserShare | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [balRes, shareRes] = await Promise.all([
        fetch('/api/balance'),
        fetch('/api/user-share'),
      ])
      if (!balRes.ok) throw new Error('Failed to fetch balance')
      const balData = await balRes.json()
      const shareData = shareRes.ok ? await shareRes.json() : { sharePercentage: 0, initialInvestment: 0 }
      setBalance(balData)
      setUserShare(shareData)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Failed to fetch balance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading && !balance) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Loading balance data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !balance) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Dashboard</h1>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchData() }}
              className="mt-2 text-sm text-emerald-400 hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!balance) return null

  const sharePct = userShare?.sharePercentage ?? 0
  const initialInvestment = userShare?.initialInvestment ?? 0
  const shareMultiplier = sharePct / 100

  // Personal values
  const myUsd = balance.totalUsd * shareMultiplier
  const myHype = balance.totalHype * shareMultiplier
  const myBtc = balance.totalBtc * shareMultiplier
  const myPnl = initialInvestment > 0 ? myUsd - initialInvestment : 0
  const myPnlPct = initialInvestment > 0 ? ((myUsd - initialInvestment) / initialInvestment) * 100 : 0

  const totalHypeValue = balance.totalHype * balance.hypePrice
  const allocations = [
    {
      label: 'Spot HYPE',
      hype: balance.spotHype,
      usd: balance.spotHype * balance.hypePrice,
      pct: balance.totalHype > 0 ? (balance.spotHype / balance.totalHype) * 100 : 0,
      color: 'bg-emerald-500',
    },
    {
      label: 'HyperLend',
      hype: balance.hyperLendHype,
      usd: balance.hyperLendHype * balance.hypePrice,
      pct: balance.totalHype > 0 ? (balance.hyperLendHype / balance.totalHype) * 100 : 0,
      color: 'bg-blue-500',
    },
    {
      label: 'HyperEVM',
      hype: balance.evmNativeHype,
      usd: balance.evmNativeHype * balance.hypePrice,
      pct: balance.totalHype > 0 ? (balance.evmNativeHype / balance.totalHype) * 100 : 0,
      color: 'bg-purple-500',
    },
    {
      label: 'Perps (USDC)',
      hype: 0,
      usd: balance.perpValueUsd,
      pct: 0,
      color: 'bg-amber-500',
      isUsdc: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Tracking: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">0x4311...45A3</code>
          </p>
        </div>
        <div className="text-right">
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Badge variant="secondary" className="text-emerald-400 border-emerald-400/20">
            Auto-refresh 30s
          </Badge>
        </div>
      </div>

      {/* Personal Portfolio Section */}
      {sharePct > 0 && (
        <>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Your Position</h2>
            <p className="text-xs text-muted-foreground">
              {formatNumber(sharePct, 2)}% share · {formatUsd(initialInvestment)} invested
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Your Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">
                  {formatUsd(myUsd)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatNumber(myHype, 2)} HYPE
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Your P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${myPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {myPnl >= 0 ? '+' : ''}{formatUsd(myPnl)}
                </div>
                <p className={`text-sm mt-1 ${myPnlPct >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                  {myPnlPct >= 0 ? '+' : ''}{formatNumber(myPnlPct, 2)}% return
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Your BTC Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatBtc(myBtc)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  @ {formatUsd(balance.btcPrice)}/BTC
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />
        </>
      )}

      {/* Fund Total Section */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Fund Total</h2>
        <p className="text-xs text-muted-foreground">Total fund value across all positions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total HYPE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {formatNumber(balance.totalHype, 2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              @ {formatUsd(balance.hypePrice)}/HYPE
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total USD Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatUsd(balance.totalUsd)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              HYPE: {formatUsd(totalHypeValue)} + Perps: {formatUsd(balance.perpValueUsd)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total BTC Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatBtc(balance.totalBtc)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              @ {formatUsd(balance.btcPrice)}/BTC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Breakdown */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Allocation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {allocations
              .filter((a) => !a.isUsdc && a.pct > 0)
              .map((a) => (
                <div
                  key={a.label}
                  className={`${a.color} transition-all duration-500`}
                  style={{ width: `${a.pct}%` }}
                />
              ))}
          </div>

          <Separator />

          <div className="space-y-3">
            {allocations.map((a) => (
              <div key={a.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${a.color}`} />
                  <div>
                    <p className="font-medium text-sm">{a.label}</p>
                    {!a.isUsdc && (
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(a.hype, 4)} HYPE
                        {a.pct > 0 && ` · ${formatNumber(a.pct, 1)}%`}
                      </p>
                    )}
                    {a.isUsdc && (
                      <p className="text-xs text-muted-foreground">
                        Perp margin account (USDC denominated)
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatUsd(a.usd)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/40">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">HYPE Price</span>
            </div>
            <span className="font-mono font-medium">{formatUsd(balance.hypePrice)}</span>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">BTC Price</span>
            </div>
            <span className="font-mono font-medium">{formatUsd(balance.btcPrice)}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
