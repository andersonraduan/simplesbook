import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { SettingsClient } from './settings-client'

export const metadata = {
  title: 'Configurações do Sistema - Admin',
  description: 'Gerencie as configurações gerais da aplicação',
}

export default async function AdminSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <AppLayout 
      title="Configurações do Sistema" 
      subtitle="Gerencie as configurações gerais da aplicação"
      maxWidth="7xl"
    >
      <SettingsClient />
    </AppLayout>
  )
}

