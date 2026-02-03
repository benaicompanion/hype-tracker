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

export function BalanceDashboard() {
  const [balance, setBalance] = useState<BalanceBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/balance')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBalance(data)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Failed to fetch balance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [fetchBalance])

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
              onClick={() => { setLoading(true); fetchBalance() }}
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
            Tracking: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">0x2246...3736</code>
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

      {/* Total Value Cards */}
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
          {/* Visual bar */}
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

          {/* Detail rows */}
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
