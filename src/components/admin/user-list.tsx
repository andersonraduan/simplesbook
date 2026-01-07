'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface UserListProps {
  users: User[]
  onUserUpdated: () => void
  currentUserId: string
}

export function UserList({ users, onUserUpdated, currentUserId }: UserListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const action = currentActive ? 'desativar' : 'ativar'
    
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
      return
    }

    setUpdatingId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar usuário')
      }

      onUserUpdated()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    
    if (!confirm(`Tem certeza que deseja alterar o perfil deste usuário para ${newRole}?`)) {
      return
    }

    setUpdatingId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar usuário')
      }

      onUserUpdated()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR')
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhum usuário encontrado.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {user.name || 'Sem nome'}
                  {user.id === currentUserId && (
                    <Badge variant="secondary">Você</Badge>
                  )}
                  {user.role === 'ADMIN' && (
                    <Badge variant="default">Admin</Badge>
                  )}
                  {!user.active && (
                    <Badge variant="destructive">Inativo</Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                {user.id !== currentUserId && (
                  <>
                    <Button
                      size="sm"
                      variant={user.active ? 'destructive' : 'default'}
                      onClick={() => handleToggleActive(user.id, user.active)}
                      disabled={updatingId === user.id}
                    >
                      {updatingId === user.id
                        ? 'Processando...'
                        : user.active
                        ? 'Desativar'
                        : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={updatingId === user.id}
                    >
                      {user.role === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Clientes</p>
                <p className="font-medium">{user._count.clientes}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serviços</p>
                <p className="font-medium">{user._count.servicos}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Agendamentos</p>
                <p className="font-medium">{user._count.agendamentos}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatarData(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

