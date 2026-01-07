# SimplesBook - Sistema de Agendamento

Sistema de agendamento com autenticação e controle de acesso baseado em roles (ADMIN e USER).

## ⚠️ Importante: Proteger Dados do Banco

**Para evitar perda de usuários de teste e dados:**

1. **Use `npm run db:migrate`** ao invés de `db:push` (preserva dados)
2. **Sempre execute `npm run db:seed`** após alterações no schema
3. **Leia:** `docs/DATABASE.md` - Guia completo de banco de dados

## Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **TypeScript**
- **NextAuth.js v5** (Auth.js)
- **Prisma ORM**
- **MySQL**
- **Tailwind CSS**
- **shadcn/ui**
- **bcryptjs**

## Estrutura do Projeto

```
simplesbook/
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── seed.ts             # Seed com usuários de teste
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/  # Dashboard do ADMIN
│   │   ├── dashboard/      # Dashboard do USER
│   │   ├── login/          # Página de login
│   │   ├── api/auth/       # Rotas NextAuth
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página inicial (redireciona)
│   ├── components/
│   │   ├── auth/           # Componentes de autenticação
│   │   └── ui/             # Componentes shadcn/ui
│   ├── lib/
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── utils.ts        # Utilitários
│   ├── types/
│   │   └── next-auth.d.ts  # Tipos estendidos NextAuth
│   ├── auth.ts             # Configuração NextAuth
│   └── middleware.ts       # Middleware de proteção de rotas
├── .env                    # Variáveis de ambiente
├── .env.example            # Exemplo de variáveis
└── package.json
```

## Configuração Inicial

### 1. Banco de Dados MySQL

Certifique-se de ter o MySQL rodando localmente e crie o banco de dados:

```sql
CREATE DATABASE simplesbook;
```

### 2. Variáveis de Ambiente

O arquivo `.env` já está configurado com:

```env
DATABASE_URL="mysql://root:@localhost:3306/simplesbook"
NEXTAUTH_SECRET="simplesbook-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Instalação das Dependências

As dependências já foram instaladas. Se precisar reinstalar:

```bash
npm install
```

### 4. Configuração do Banco de Dados

O schema já foi criado e o seed executado. Se precisar refazer:

```bash
# Sincronizar schema com banco
npm run db:push

# Executar seed (cria usuários de teste)
npm run db:seed
```

## Executar o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais de Teste

### Administrador
- **Email:** admin@simplesbook.com
- **Senha:** admin123
- **Acesso:** Dashboard administrativo com estatísticas e gestão

### Usuário Comum
- **Email:** user@simplesbook.com
- **Senha:** user123
- **Acesso:** Dashboard de usuário para agendamentos

## Funcionalidades Implementadas

### ✅ Módulo 1: Autenticação e Roles

- [x] Sistema de login com email e senha
- [x] Hash de senhas com bcryptjs
- [x] Autenticação via NextAuth.js (Credentials Provider)
- [x] 2 roles: ADMIN e USER
- [x] Middleware de proteção de rotas
- [x] Redirecionamento automático baseado em role
- [x] Dashboard específico para ADMIN
- [x] Dashboard específico para USER
- [x] Função de logout
- [x] Session management com JWT

### Fluxo de Autenticação

1. **Usuário não autenticado** → Redirecionado para `/login`
2. **Login bem-sucedido** → Redirecionado para dashboard apropriado
3. **ADMIN** → `/admin/dashboard`
4. **USER** → `/dashboard`
5. **Tentativa de acesso não autorizado** → Redirecionado para dashboard correto

### Proteção de Rotas

O middleware protege automaticamente:
- `/dashboard` - Requer autenticação (USER ou ADMIN)
- `/admin/*` - Requer autenticação + role ADMIN
- `/login` - Redireciona se já autenticado

## Estrutura do Banco de Dados

### Modelo User

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
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

## Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter

npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com banco
npm run db:migrate   # Cria e aplica migrações
npm run db:seed      # Executa seed do banco
```

## Próximos Módulos

Os próximos módulos incluirão:

1. **Módulo de Agendamentos**
   - CRUD de agendamentos
   - Calendário visual
   - Notificações

2. **Módulo de Gestão de Usuários (ADMIN)**
   - Listar usuários
   - Criar/editar/excluir usuários
   - Gerenciar roles

3. **Módulo de Perfil**
   - Editar dados do usuário
   - Alterar senha
   - Upload de foto de perfil

4. **Módulo de Configurações**
   - Horários de funcionamento
   - Tipos de serviço
   - Configurações de notificação

## Design e UI

- **UI Library:** shadcn/ui (componentes modernos e acessíveis)
- **Estilização:** Tailwind CSS
- **Tema:**
  - Dashboard USER: Tons de cinza (slate)
  - Dashboard ADMIN: Tons de índigo (indigo)
- **Responsivo:** Layout funciona em mobile, tablet e desktop

## Segurança

- ✅ Senhas hashadas com bcryptjs (10 rounds)
- ✅ JWT para sessão (httpOnly, secure)
- ✅ Middleware de proteção de rotas
- ✅ Verificação de role no servidor
- ✅ Validação de credenciais no login
- ✅ Redirecionamentos de segurança

## Boas Práticas Aplicadas

- **KISS:** Código simples e direto
- **DRY:** Reutilização via componentes e utilitários
- **Type Safety:** TypeScript em todo projeto
- **Server Components:** Uso de React Server Components quando possível
- **Client Components:** Apenas onde necessário (formulários, interatividade)
- **Prisma Singleton:** Previne múltiplas conexões em dev

## Desenvolvimento

### Adicionar Novo Componente shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Modificar Schema do Banco

1. Edite `prisma/schema.prisma`
2. Execute `npm run db:push` para sincronizar
3. Execute `npm run db:generate` para atualizar o cliente

### Criar Nova Migração

```bash
npx prisma migrate dev --name [migration-name]
```

## Troubleshooting

### Erro de conexão com MySQL

- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `npx prisma db pull`

### Erro ao fazer login

- Verifique se o seed foi executado
- Confirme que o `NEXTAUTH_SECRET` está configurado
- Verifique os logs do console

### Erro de autenticação

- Limpe os cookies do navegador
- Verifique se a sessão está sendo criada corretamente
- Inspecione o middleware

## Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte a documentação das tecnologias
3. Revise os logs de erro

---

**Desenvolvido com Next.js 14 + Prisma + NextAuth.js**
