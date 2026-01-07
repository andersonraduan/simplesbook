'use client'

import Link from 'next/link'

interface AdminDashboardClientProps {
  totalUsers: number
  adminUsers: number
  regularUsers: number
}

export default function AdminDashboardClient({
  totalUsers,
  adminUsers,
  regularUsers
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-8">

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span className="material-icons text-2xl">group</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total de Usuários</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <span className="material-icons text-2xl">admin_panel_settings</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Administradores</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminUsers}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-icons text-2xl">person</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Usuários Comuns</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{regularUsers}</p>
        </div>
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/usuarios"
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-icons text-indigo-600 dark:text-indigo-400">manage_accounts</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Usuários</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ativar, desativar e gerenciar permissões de usuários</p>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-icons text-indigo-600 dark:text-indigo-400">settings</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações do Sistema</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalize o nome da aplicação e outras configurações</p>
        </Link>

        <Link
          href="/relatorios"
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-icons text-indigo-600 dark:text-indigo-400">assessment</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Relatórios</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visualize relatórios e métricas do sistema</p>
        </Link>
      </div>
    </div>
  )
}

