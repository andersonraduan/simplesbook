# 🚀 Início Rápido - SimplesBook

## Setup em 3 Passos

### 1️⃣ Banco de Dados
```bash
# Criar banco no MySQL
mysql -u root -e "CREATE DATABASE simplesbook;"

# Sincronizar schema (já executado)
npm run db:push
```

### 2️⃣ Iniciar Aplicação
```bash
npm run dev
```

### 3️⃣ Acessar
Abra [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciais de Teste

### 👨‍💼 Admin
```
Email: admin@simplesbook.com
Senha: admin123
```

### 👤 Usuário
```
Email: user@simplesbook.com
Senha: user123
```

## 📋 Checklist

- [x] Next.js 14 instalado
- [x] Prisma configurado
- [x] MySQL conectado
- [x] NextAuth configurado
- [x] Seed executado
- [x] Login funcionando
- [x] Dashboard USER pronto
- [x] Dashboard ADMIN pronto
- [x] Middleware protegendo rotas

## 🎯 O Que Foi Implementado

### ✅ Sistema de Autenticação
- Login com email/senha
- Hash seguro de senhas (bcryptjs)
- JWT para sessão
- Logout funcional

### ✅ Controle de Acesso (Roles)
- Role ADMIN (acesso total)
- Role USER (acesso limitado)
- Middleware protegendo rotas
- Redirecionamento automático

### ✅ Dashboards
- Dashboard ADMIN com estatísticas
- Dashboard USER para agendamentos
- Design responsivo
- UI moderna (shadcn/ui + Tailwind)

### ✅ Segurança
- Senhas hashadas
- Rotas protegidas
- Validação de sessão
- Type-safe com TypeScript

## 🔄 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server

# Banco de Dados
npm run db:migrate       # ✅ Criar migração (RECOMENDADO - preserva dados)
npm run db:push          # ⚠️ Sincronizar schema (pode limpar dados)
npm run db:seed          # 🌱 Criar usuários de teste
npm run db:generate      # 🔄 Gerar Prisma Client

# Qualidade
npm run lint             # Verificar código
npm run build            # Build produção
```

### ⚠️ IMPORTANTE: Não Perder Dados

**Sempre que usar `db:push` ou fazer alterações no schema:**

1. Use `db:migrate` ao invés de `db:push` (mais seguro)
2. Após qualquer alteração, execute:
   ```bash
   npm run db:seed
   ```

**📖 Guia Completo:** Veja `docs/DATABASE.md` para evitar perda de dados

## 📁 Arquivos Importantes

```
src/
├── auth.ts                    # ⚙️ Config NextAuth
├── middleware.ts              # 🛡️ Proteção de rotas
├── app/
│   ├── login/page.tsx        # 🔐 Página de login
│   ├── dashboard/page.tsx    # 👤 Dashboard USER
│   └── admin/dashboard/      # 👨‍💼 Dashboard ADMIN
├── lib/prisma.ts             # 💾 Cliente DB
└── types/next-auth.d.ts      # 📝 Tipos

prisma/
├── schema.prisma             # 📊 Schema DB
└── seed.ts                   # 🌱 Dados iniciais
```

## 🎨 Design System

- **Cores USER:** Tons de cinza (slate)
- **Cores ADMIN:** Tons de índigo (indigo)
- **Componentes:** shadcn/ui
- **Estilo:** Tailwind CSS
- **Ícones:** Lucide React

## 🐛 Troubleshooting

### Erro de conexão MySQL?
```bash
# Verificar se MySQL está rodando
# Confirmar credenciais no .env
```

### Erro ao fazer login?
```bash
# Executar seed novamente
npm run db:seed
```

### Página em branco?
```bash
# Limpar cache e rebuildar
rm -rf .next
npm run dev
```

## 📖 Documentação Completa

- **README.md** - Documentação detalhada
- **ARCHITECTURE.md** - Arquitetura do sistema
- **docs/DATABASE.md** - Guia de banco de dados e migrações
- **docs/CLIENTES.md** - Documentação do módulo de Clientes
- **docs/SERVICOS.md** - Documentação do módulo de Serviços

## 🚦 Próximos Módulos

1. **Agendamentos** (CRUD completo)
2. **Gestão de Usuários** (ADMIN)
3. **Perfil do Usuário**
4. **Notificações**
5. **Relatórios**

## 💡 Dicas

- Use **ADMIN** para ver estatísticas
- Use **USER** para testar fluxo normal
- Middleware protege automaticamente
- Server Components = melhor performance

---

**🎉 Tudo pronto! Comece logando com as credenciais acima.**

