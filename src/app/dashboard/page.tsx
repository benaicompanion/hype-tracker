import { AppShell } from '@/components/app-shell'
import { BalanceDashboard } from '@/components/balance-dashboard'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <AppShell>
      <BalanceDashboard />
    </AppShell>
  )
}
