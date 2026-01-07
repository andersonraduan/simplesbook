import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { UserManagementClient } from './user-management-client'

export const metadata = {
  title: 'Gerenciar Usuários - Admin',
  description: 'Gerenciar usuários do sistema',
}

export default async function UsuariosPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <AppLayout 
      title="Gerenciar Usuários" 
      subtitle="Gerencie todos os usuários do sistema"
      maxWidth="7xl"
    >
      <Suspense fallback={<div className="text-center py-12 text-gray-500">Carregando usuários...</div>}>
        <UserManagementClient currentUserId={session.user.id} />
      </Suspense>
    </AppLayout>
  )
}

