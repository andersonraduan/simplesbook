import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/app-layout'
import AdminDashboardClient from './admin-dashboard-client'

export const metadata = {
  title: 'Dashboard Administrativo',
  description: 'Painel de controle administrativo',
}

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Buscar estatísticas
  const totalUsers = await prisma.user.count()
  const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } })
  const regularUsers = await prisma.user.count({ where: { role: 'USER' } })

  return (
    <AppLayout 
      title="Dashboard Administrativo" 
      subtitle={`Bem-vindo, ${session.user.name || session.user.email}!`}
      maxWidth="7xl"
    >
      <AdminDashboardClient 
        totalUsers={totalUsers}
        adminUsers={adminUsers}
        regularUsers={regularUsers}
      />
    </AppLayout>
  )
}

