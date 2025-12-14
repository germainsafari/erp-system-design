"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { ChartWrapper } from "@/components/dashboard/chart-wrapper"
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Lazy load Recharts components to avoid React 19 hydration issues
const RevenueChart = lazy(() => import("@/components/dashboard/revenue-chart").then(module => ({ default: module.RevenueChart })))
const CashFlowForecast = lazy(() => import("@/components/dashboard/cash-flow-forecast").then(module => ({ default: module.CashFlowForecast })))

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats")
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <AppLayout title={t('title')} description={t('description')}>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <StatsCard
          title={t('totalRevenue')}
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          changeLabel={t('vsLastMonth')}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatsCard
          title={t('totalOrders')}
          value={stats.totalOrders}
          change={stats.ordersChange}
          changeLabel={t('vsLastMonth')}
          icon={ShoppingCart}
          iconColor="text-primary"
        />
        <StatsCard title={t('products')} value={stats.totalProducts} icon={Package} iconColor="text-chart-3" />
        <StatsCard title={t('customers')} value={stats.totalCustomers} icon={Users} iconColor="text-chart-5" />
        <StatsCard title={t('lowStock')} value={stats.lowStockCount} icon={AlertTriangle} iconColor="text-warning" />
        <StatsCard title={t('pendingOrders')} value={stats.pendingOrders} icon={Clock} iconColor="text-chart-4" />
      </div>

      {/* Cash Flow Forecast */}
      <div className="mb-6">
        <ChartWrapper fallback={
          <div className="border rounded-lg p-6 bg-card">
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading forecast...</p>
            </div>
          </div>
        }>
          <Suspense fallback={
            <div className="border rounded-lg p-6 bg-card">
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading forecast...</p>
              </div>
            </div>
          }>
            <CashFlowForecast />
          </Suspense>
        </ChartWrapper>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper fallback={
            <div className="border rounded-lg p-6 bg-card">
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading chart...</p>
              </div>
            </div>
          }>
            <Suspense fallback={
              <div className="border rounded-lg p-6 bg-card">
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading chart...</p>
                </div>
              </div>
            }>
              <RevenueChart />
            </Suspense>
          </ChartWrapper>
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <RecentOrders />
      </div>
    </AppLayout>
  )
}





