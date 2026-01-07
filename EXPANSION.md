# 🔮 SimplesBook - Guia de Expansão

Este documento fornece exemplos práticos de como expandir o SimplesBook com novos módulos e funcionalidades.

---

## 📅 Módulo 2: Sistema de Agendamentos (Exemplo)

### 1. Schema Prisma

```prisma
// prisma/schema.prisma

model Appointment {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  duration    Int      // minutos
  status      AppointmentStatus @default(PENDING)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  serviceId   String?
  service     Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([date])
}

model Service {
  id           String        @id @default(cuid())
  name         String
  description  String?
  duration     Int          // minutos
  price        Decimal      @db.Decimal(10, 2)
  active       Boolean      @default(true)
  
  appointments Appointment[]
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

// Atualizar model User
model User {
  // ... campos existentes
  appointments Appointment[]
}
```

### 2. API Routes

```typescript
// src/app/api/appointments/route.ts
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      service: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Validar conflitos de horário
  const conflict = await prisma.appointment.findFirst({
    where: {
      date: body.date,
      status: { not: 'CANCELLED' },
    },
  })

  if (conflict) {
    return NextResponse.json(
      { error: 'Horário já reservado' },
      { status: 409 }
    )
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...body,
      userId: session.user.id,
    },
    include: {
      service: true,
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
```

### 3. Componente de Calendário

```typescript
// src/components/appointments/calendar.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

export function AppointmentCalendar({ appointments }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Implementar lógica de calendário
  // Usar biblioteca como react-big-calendar ou date-fns

  return (
    <Card>
      {/* Calendário aqui */}
    </Card>
  )
}
```

---

## 👥 Módulo 3: Gestão de Usuários (ADMIN)

### 1. Página de Listagem

```typescript
// src/app/admin/users/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/users-table'

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { appointments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Usuários</h1>
      <UsersTable users={users} />
    </div>
  )
}
```

### 2. Componente de Tabela

```typescript
// src/components/admin/users-table.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UsersTable({ users }) {
  const [selectedUsers, setSelectedUsers] = useState([])

  async function handleDeleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      // Revalidar ou atualizar estado
    }
  }

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Agendamentos</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name || '-'}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user._count.appointments}</TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleRole(user.id, user.role)}
              >
                Toggle Role
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteUser(user.id)}
              >
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 👤 Módulo 4: Perfil do Usuário

### 1. Página de Perfil

```typescript
// src/app/profile/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordForm } from '@/components/profile/password-form'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      
      <div className="space-y-6">
        <ProfileForm user={user} />
        <PasswordForm userId={user.id} />
      </div>
    </div>
  )
}
```

### 2. Formulário de Atualização

```typescript
// src/components/profile/profile-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfileForm({ user }) {
  const [name, setName] = useState(user.name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        setMessage('Perfil atualizado com sucesso!')
      } else {
        setMessage('Erro ao atualizar perfil')
      }
    } catch (error) {
      setMessage('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          {message && (
            <div className="text-sm text-green-600">{message}</div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## 🔔 Módulo 5: Notificações

### 1. Schema Prisma

```prisma
model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      NotificationType
  read      Boolean  @default(false)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([userId, read])
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}

// Atualizar User
model User {
  // ... campos existentes
  notifications Notification[]
}
```

### 2. API Route

```typescript
// src/app/api/notifications/route.ts
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(notifications)
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notificationId } = await request.json()

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}
```

### 3. Componente de Badge

```typescript
// src/components/notifications/notification-badge.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnreadCount() {
      const res = await fetch('/api/notifications/unread')
      const data = await res.json()
      setUnreadCount(data.count)
    }

    fetchUnreadCount()
    
    // Poll a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Button variant="ghost" className="relative">
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  )
}
```

---

## 🔧 Adicionando Validação com Zod

```typescript
// src/lib/validations/appointment.ts
import { z } from 'zod'

export const createAppointmentSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  date: z.coerce.date(),
  duration: z.number().min(15, 'Duração mínima é 15 minutos'),
  serviceId: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

// Uso na API
export async function POST(request: Request) {
  const body = await request.json()
  
  const validation = createAppointmentSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.flatten() },
      { status: 400 }
    )
  }
  
  // Continuar com dados validados
  const data = validation.data
}
```

---

## 📊 Adicionando Analytics

```typescript
// src/lib/analytics.ts
export async function trackEvent(event: string, properties?: object) {
  // Implementar com sua ferramenta de analytics
  // Ex: Google Analytics, Mixpanel, Amplitude
  
  if (typeof window !== 'undefined') {
    window.gtag?.('event', event, properties)
  }
}

// Uso
trackEvent('appointment_created', {
  appointment_id: appointment.id,
  user_role: session.user.role,
})
```

---

## 🎯 Boas Práticas ao Expandir

1. **Sempre crie migrations do Prisma**
   ```bash
   npx prisma migrate dev --name add_appointments
   ```

2. **Valide dados no servidor**
   - Use Zod para schemas de validação
   - Nunca confie apenas em validação client-side

3. **Proteja todas as rotas**
   - Sempre valide `auth()` em páginas protegidas
   - Verifique roles em operações sensíveis

4. **Use TypeScript**
   - Aproveite os tipos gerados pelo Prisma
   - Crie interfaces para props de componentes

5. **Mantenha componentes pequenos**
   - < 250 linhas por arquivo
   - Extraia lógica complexa para hooks

6. **Error handling robusto**
   - Try-catch em operações assíncronas
   - Feedback visual para usuário

7. **Loading states**
   - Sempre mostre estados de carregamento
   - Use Suspense quando possível

---

Este guia fornece uma base sólida para expandir o SimplesBook mantendo a qualidade e os padrões estabelecidos no Módulo 1.

