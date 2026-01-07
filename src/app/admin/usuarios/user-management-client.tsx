'use client'

import { useEffect, useState } from 'react'
import { UserList } from '@/components/admin/user-list'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  active: boolean
  createdAt: string
  updatedAt: string
  _count: {
    clientes: number
    servicos: number
    agendamentos: number
  }
}

interface UserManagementClientProps {
  currentUserId: string
}

export function UserManagementClient({ currentUserId }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterRole, setFilterRole] = useState<'all' | 'ADMIN' | 'USER'>('all')

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }

      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filtrar por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) =>
        filterStatus === 'active' ? user.active : !user.active
      )
    }

    // Filtrar por role
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, filterStatus, filterRole, users])

  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">Carregando usuários...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Usuários ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Usuários inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <Badge
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Badge>
                <Badge
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterStatus('active')}
                >
                  Ativos
                </Badge>
                <Badge
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inativos
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={filterRole === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterRole('all')}
                >
                  Todas funções
                </Badge>
                <Badge
                  variant={filterRole === 'ADMIN' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterRole('ADMIN')}
                >
                  Admins
                </Badge>
                <Badge
                  variant={filterRole === 'USER' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterRole('USER')}
                >
                  Usuários
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <UserList
        users={filteredUsers}
        onUserUpdated={fetchUsers}
        currentUserId={currentUserId}
      />
    </div>
  )
}

