# Guia de Banco de Dados

## Usuários de Teste

O sistema possui 2 usuários pré-configurados:

### Admin
- **Email:** `admin@simplesbook.com`
- **Senha:** `admin123`
- **Role:** ADMIN
- **Acesso:** Dashboard administrativo

### Usuário
- **Email:** `user@simplesbook.com`
- **Senha:** `user123`
- **Role:** USER
- **Acesso:** Dashboard de usuário, Clientes, Serviços

## Como Recriar Usuários de Teste

Se o banco de dados foi limpo ou os usuários foram perdidos, execute:

```bash
npm run db:seed
```

Este comando recria os usuários de teste automaticamente usando o arquivo `prisma/seed.ts`.

## Sincronização do Prisma

### ⚠️ IMPORTANTE: Evitar Perda de Dados

Existem 3 comandos principais do Prisma:

### 1. `npm run db:push` (Desenvolvimento)
```bash
npm run db:push
```

**Quando usar:**
- Durante desenvolvimento
- Para sincronizar schema rapidamente
- **⚠️ ATENÇÃO:** Pode limpar dados em algumas situações

**Após usar, sempre execute:**
```bash
npm run db:seed
```

### 2. `npm run db:migrate` (Recomendado)
```bash
npm run db:migrate
```

**Quando usar:**
- Para criar migrações versionadas
- Em produção
- Quando quiser histórico de alterações
- **✅ SEGURO:** Preserva dados existentes

**Como funciona:**
1. Cria arquivo de migração em `prisma/migrations/`
2. Aplica mudanças no banco
3. Mantém registro de todas as alterações

### 3. `npm run db:generate`
```bash
npm run db:generate
```

**Quando usar:**
- Após alterar `schema.prisma`
- Para regenerar o Prisma Client
- Não altera o banco de dados

## Fluxo de Trabalho Recomendado

### Durante Desenvolvimento

1. **Alterar schema:**
   - Edite `prisma/schema.prisma`

2. **Aplicar mudanças:**
   ```bash
   npm run db:migrate
   ```

3. **Se necessário, recriar dados de teste:**
   ```bash
   npm run db:seed
   ```

### Adicionar Novo Campo (Exemplo)

1. Edite `prisma/schema.prisma`
2. Execute:
   ```bash
   npm run db:migrate
   ```
3. Digite nome da migração (ex: "add_time_execution_to_servico")
4. Se houver dados existentes e campo obrigatório, Prisma perguntará o valor padrão
5. Reexecute seed se necessário:
   ```bash
   npm run db:seed
   ```

## Reset Completo do Banco

Se precisar começar do zero:

```bash
# 1. Reset completo (CUIDADO: apaga TUDO!)
npx prisma migrate reset

# 2. Recria usuários de teste
npm run db:seed
```

**⚠️ Nunca use em produção!**

## Backup de Dados

Para proteger dados importantes, faça backup regular:

```bash
# MySQL/MariaDB
mysqldump -u root -p simplesbook > backup.sql

# Restaurar
mysql -u root -p simplesbook < backup.sql
```

## Boas Práticas

1. **✅ USE `db:migrate`** para mudanças importantes
2. **✅ SEMPRE** execute `db:seed` após limpar banco
3. **✅ COMMIT** arquivos de migração no Git
4. **❌ EVITE** `db:push` em produção
5. **❌ NUNCA** faça `migrate reset` em produção
6. **✅ FAÇA** backups regulares dos dados

## Estrutura de Arquivos

```
prisma/
├── schema.prisma       # Schema do banco
├── seed.ts            # Dados iniciais (usuários de teste)
└── migrations/        # Histórico de migrações
    └── [timestamp]_[nome]/
        └── migration.sql
```

## Troubleshooting

### Erro: "Unknown argument" após alterar schema

**Problema:** Prisma Client não foi regenerado

**Solução:**
```bash
npm run db:generate
```

### Erro: Arquivo em uso durante generate

**Problema:** Servidor dev está rodando

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Execute o comando
3. Reinicie o servidor

### Perdeu usuários de teste

**Solução:**
```bash
npm run db:seed
```

### Quer adicionar mais dados de exemplo

Edite `prisma/seed.ts` e adicione novos registros usando `upsert` para evitar duplicatas.

