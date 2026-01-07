import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard do usuário',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  // Buscar dados reais do banco
  const totalClientes = await prisma.cliente.count({
    where: {
      userId: session.user.id
    }
  })

  // Buscar agendamentos de hoje
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const agendamentosHoje = await prisma.agendamento.count({
    where: {
      userId: session.user.id,
      dataHoraInicio: {
        gte: hoje,
        lt: amanha
      }
    }
  })

  const cards = [
    {
      title: 'Meus Clientes',
      description: 'Gerencie sua base de clientes, visualize históricos e adicione novos contatos.',
      icon: 'people',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: totalClientes > 0 ? `${totalClientes} ${totalClientes === 1 ? 'Cliente' : 'Clientes'}` : undefined,
      badgeBg: 'bg-blue-100 dark:bg-blue-900',
      badgeColor: 'text-blue-800 dark:text-blue-200',
      link: '/clientes',
      buttonText: 'Acessar Clientes',
      buttonIcon: 'arrow_forward',
    },
    {
      title: 'Meus Serviços',
      description: 'Gerencie seu catálogo de serviços, preços, durações e disponibilidades.',
      icon: 'spa',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      link: '/servicos',
      buttonText: 'Acessar Serviços',
      buttonIcon: 'arrow_forward',
    },
    {
      title: 'Meus Agendamentos',
      description: 'Visualize sua agenda completa, remarque horários e verifique status.',
      icon: 'event_note',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      badge: agendamentosHoje > 0 ? `${agendamentosHoje} Hoje` : undefined,
      badgeBg: 'bg-red-100 dark:bg-red-900',
      badgeColor: 'text-red-800 dark:text-red-200',
      badgeAnimate: agendamentosHoje > 0,
      link: '/agendamentos',
      buttonText: 'Acessar Agendamentos',
      buttonIcon: 'arrow_forward',
    },
    {
      title: 'Novo Agendamento',
      description: 'Crie rapidamente um novo agendamento para um cliente existente ou novo.',
      icon: 'add',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      link: '/agendamentos',
      buttonText: 'Criar Agendamento',
      buttonIcon: 'add_circle_outline',
      highlight: true,
    },
    {
      title: 'Notificações',
      description: 'Configure lembretes por SMS e WhatsApp para seus clientes não esquecerem.',
      icon: 'notifications_active',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      link: '/notifications',
      buttonText: 'Gerenciar Notificações',
      buttonIcon: 'settings',
    },
  ]

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Bem-vindo de volta, ${session.user.name || session.user.email}!`}
      maxWidth="7xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group ${
                card.highlight ? 'relative' : ''
              }`}
            >
              {card.highlight && (
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-icons text-9xl">add_circle</span>
                </div>
              )}
              <div className={`p-6 flex-1 ${card.highlight ? 'relative z-10' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`h-12 w-12 ${card.iconBg} rounded-lg flex items-center justify-center ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="material-icons text-2xl">{card.icon}</span>
                  </div>
                  {card.badge && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${card.badgeBg} ${card.badgeColor} ${
                        card.badgeAnimate ? 'animate-pulse' : ''
                      }`}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {card.description}
                </p>
              </div>
              <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 ${card.highlight ? 'relative z-10' : ''}`}>
                <Link href={card.link}>
                  <button className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                    <span>{card.buttonText}</span>
                    <span className="material-icons text-sm">{card.buttonIcon}</span>
                  </button>
                </Link>
              </div>
            </div>
        ))}

        {/* Card de Perfil */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-2xl">person</span>
                </div>
                <Link
                  href="/perfil"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
                >
                  Editar
                  <span className="material-icons text-sm ml-1">edit</span>
                </Link>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Perfil
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 text-sm mt-0.5 mr-2">email</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 text-sm mt-0.5 mr-2">badge</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Nome
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {session.user.name || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 text-sm mt-0.5 mr-2">
                    verified_user
                  </span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Tipo
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-200">Usuário</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              <Link href="/perfil">
                <button className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                  <span>Acessar Perfil</span>
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

