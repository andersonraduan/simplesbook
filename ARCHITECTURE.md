# Arquitetura do SimplesBook

## Visão Geral

SimplesBook é uma aplicação de agendamento construída com Next.js 14 usando o App Router. A arquitetura segue os princípios KISS, DRY e YAGNI, priorizando simplicidade e manutenibilidade.

## Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI modernos

### Backend
- **Next.js API Routes** - Endpoints serverless
- **NextAuth.js v5** - Autenticação
- **Prisma ORM** - Camada de dados
- **MySQL** - Banco de dados relacional

### Segurança
- **bcryptjs** - Hash de senhas
- **JWT** - Tokens de sessão
- **Middleware** - Proteção de rotas

## Arquitetura de Diretórios

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   │   └── login/         # Página de login
│   ├── (protected)/       # Grupo de rotas protegidas
│   │   ├── dashboard/     # Dashboard USER
│   │   └── admin/         # Dashboard ADMIN
│   ├── api/               # API Routes
│   │   └── auth/          # Endpoints NextAuth
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticação
│   └── ui/               # Componentes shadcn/ui
├── lib/                  # Bibliotecas e utilitários
│   ├── prisma.ts         # Cliente Prisma singleton
│   └── utils.ts          # Funções utilitárias
├── types/                # Definições de tipos
│   └── next-auth.d.ts    # Extensões NextAuth
├── auth.ts               # Configuração NextAuth
└── middleware.ts         # Middleware de rotas
```

## Fluxo de Dados

### Autenticação

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌───────┐
│ Cliente │────▶│ NextAuth │────▶│  Prisma  │────▶│ MySQL │
└─────────┘     └──────────┘     └──────────┘     └───────┘
     │               │                  │              │
     │          Valida JWT         Busca User     Verifica
     │               │                  │          Senha
     │               │◀─────────────────┘              │
     │               │                                 │
     │          Cria Sessão                            │
     │               │                                 │
     │◀──────────────┘                                 │
 Recebe JWT
```

### Autorização (Middleware)

```
Request
   │
   ▼
Middleware
   │
   ├─ Rota pública? ──▶ Permitir
   │
   ├─ Autenticado? ──▶ Não ──▶ Redirecionar /login
   │                    
   ▼ Sim
   │
   ├─ Rota /admin? ──▶ Sim ──▶ Role ADMIN? ──▶ Não ──▶ Redirecionar /dashboard
   │                                │
   │                                ▼ Sim
   │                            Permitir
   ▼
Permitir
```

## Modelo de Dados

### Schema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  USER
}
```

### Relacionamentos Futuros

```
User (1) ──▶ (N) Appointment
User (1) ──▶ (N) Notification
Admin (1) ──▶ (N) ServiceType
Appointment (N) ──▶ (1) ServiceType
```

## Padrões de Código

### Server Components (Padrão)

- Componentes React renderizados no servidor
- Acesso direto ao banco de dados
- Não enviados ao cliente (menor bundle)
- Usados em layouts e páginas estáticas

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await auth() // Server-side
  const data = await prisma.user.findMany() // Direto no DB
  
  return <Dashboard data={data} />
}
```

### Client Components (Quando Necessário)

- Marcados com `'use client'`
- Contém interatividade (eventos, state)
- Usados em formulários e componentes dinâmicos

```tsx
// src/app/login/page.tsx
'use client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  // ... lógica interativa
}
```

### Server Actions

- Funções executadas no servidor
- Chamadas diretamente de Client Components
- Marcadas com `'use server'`

```tsx
<form action={async () => {
  'use server'
  await signOut({ redirectTo: '/login' })
}}>
  <Button type="submit">Sair</Button>
</form>
```

## Segurança

### Camadas de Proteção

1. **Middleware** - Primeira linha de defesa
   - Valida JWT
   - Verifica role
   - Redireciona não autorizados

2. **Server Components** - Validação adicional
   - `await auth()` em cada página protegida
   - `redirect()` se não autorizado

3. **API Routes** - Validação de endpoints
   - Verificação de sessão
   - Validação de role

### Hash de Senhas

```typescript
// Criação
const hash = await bcrypt.hash(password, 10)

// Verificação
const isValid = await bcrypt.compare(password, hash)
```

### JWT Configuration

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 dias
}
```

## Performance

### Otimizações Aplicadas

1. **Prisma Singleton** - Evita múltiplas conexões
2. **Server Components** - Menor bundle JavaScript
3. **Static Generation** - Páginas estáticas quando possível
4. **Code Splitting** - Componentes carregados sob demanda

### Métricas Esperadas

- **FCP (First Contentful Paint)** < 1.8s
- **LCP (Largest Contentful Paint)** < 2.5s
- **TTI (Time to Interactive)** < 3.8s
- **Bundle Size** ~200KB (inicial)

## Escalabilidade

### Pontos de Extensão

1. **Novos Roles** - Adicionar ao enum `Role`
2. **Novos Models** - Adicionar ao `schema.prisma`
3. **Novos Dashboards** - Criar em `app/(protected)`
4. **Novas APIs** - Criar em `app/api`

### Considerações Futuras

- **Cache** - Redis para sessões e queries frequentes
- **File Upload** - S3/CloudFlare para avatares
- **Email** - SendGrid/Resend para notificações
- **WebSockets** - Pusher/Socket.io para real-time
- **Rate Limiting** - Limitar requisições por IP

## Testing Strategy (Futuro)

### Níveis de Teste

1. **Unit Tests** - Funções utilitárias
2. **Integration Tests** - API routes e DB
3. **E2E Tests** - Fluxos críticos (login, agendamento)

### Ferramentas Sugeridas

- **Vitest** - Unit tests
- **Playwright** - E2E tests
- **Testing Library** - Component tests

## Deploy

### Ambientes

- **Development** - `npm run dev`
- **Production** - `npm run build && npm run start`

### Plataformas Recomendadas

- **Vercel** - Otimizado para Next.js
- **Railway** - Banco MySQL incluído
- **PlanetScale** - MySQL serverless

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="mysql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# Email (futuro)
EMAIL_SERVER="smtp://..."

# Storage (futuro)
S3_BUCKET="..."
```

## Monitoramento (Futuro)

### Métricas Importantes

- Taxa de login bem-sucedido
- Tempo de resposta de APIs
- Erros de autenticação
- Uso de recursos do banco

### Ferramentas Sugeridas

- **Vercel Analytics** - Web Vitals
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Prisma Accelerate** - Query performance

## Manutenibilidade

### Code Review Checklist

- [ ] TypeScript sem `any`
- [ ] Componentes < 250 linhas
- [ ] Funções < 40 linhas
- [ ] Props tipadas
- [ ] Error handling implementado
- [ ] Loading states implementados
- [ ] Acessibilidade (a11y) verificada

### Refatorações Planejadas

1. **Hooks customizados** - Extrair lógica reutilizável
2. **Context API** - Estado global se necessário
3. **Validation** - Zod para validação de schemas
4. **API Client** - Abstração para chamadas HTTP

## Decisões de Arquitetura

### Por que Next.js App Router?

- Server Components por padrão
- Melhor performance
- Streaming e Suspense nativos
- Futuro do Next.js

### Por que NextAuth.js?

- Integração nativa com Next.js
- Suporte a múltiplos providers
- Session management robusto
- Comunidade ativa

### Por que Prisma?

- Type-safe queries
- Migrações automatizadas
- Developer experience excepcional
- Support para múltiplos databases

### Por que MySQL?

- Relacional (ideal para agendamentos)
- Maduro e estável
- Bom suporte da comunidade
- Fácil de hospedar

---

**Última atualização:** Janeiro 2026

