# Migração: Campo Active no User

## Resumo das Alterações

Esta migração adiciona funcionalidade de gerenciamento de usuários para administradores.

### 1. Banco de Dados
- ✅ Adicionado campo `active` (Boolean, default: true) na tabela `User`

### 2. Backend (APIs)
- ✅ `GET /api/admin/users` - Lista todos os usuários
- ✅ `PATCH /api/admin/users/[id]` - Atualiza usuário (active, role, name)
- ✅ `DELETE /api/admin/users/[id]` - Desativa usuário (soft delete)

### 3. Frontend
- ✅ Página `/admin/usuarios` - Interface de gerenciamento
- ✅ Componente `UserList` - Lista com ações
- ✅ Componente `UserManagementClient` - Filtros e estatísticas
- ✅ Link no menu de navegação (apenas para ADMIN)

### 4. Autenticação
- ✅ Bloqueio de login para usuários inativos
- ✅ Mensagem de erro personalizada para usuários inativos
- ⚠️ Sessões ativas permanecem válidas após desativação (requerem logout manual)

### 5. Segurança
- ✅ Proteção: admin não pode desativar própria conta
- ✅ Verificação de permissões em todas as rotas
- ✅ Validação server-side e client-side

## Passo a Passo para Aplicar

### 1. Executar Migração do Prisma

```bash
# Criar e aplicar migração
npx prisma migrate dev --name add_active_to_user

# Gerar cliente Prisma atualizado
npx prisma generate
```

### 2. Verificar Banco de Dados

Após a migração, todos os usuários existentes terão `active = true` por padrão.

Para verificar:
```sql
SELECT id, email, name, role, active FROM User;
```

### 3. Testar Funcionalidade

1. **Fazer login como ADMIN**
   ```
   Acesse: http://localhost:3000/login
   ```

2. **Acessar página de gerenciamento**
   ```
   Acesse: http://localhost:3000/admin/usuarios
   ```

3. **Testar ações**
   - Visualizar lista de usuários
   - Desativar um usuário de teste
   - Tentar fazer login com usuário desativado (deve falhar)
   - Reativar o usuário
   - Alterar role de um usuário

### 4. Verificar Menu de Navegação

- ✅ Link "Gerenciar Usuários" aparece para ADMIN
- ✅ Link NÃO aparece para usuários comuns

## Arquivos Criados/Modificados

### Novos Arquivos
```
src/app/api/admin/users/route.ts
src/app/api/admin/users/[id]/route.ts
src/app/admin/usuarios/page.tsx
src/app/admin/usuarios/user-management-client.tsx
src/components/admin/user-list.tsx
docs/GERENCIAMENTO_USUARIOS.md
```

### Arquivos Modificados
```
prisma/schema.prisma (campo active adicionado)
src/auth.ts (validação de usuário ativo)
src/components/layout/app-nav.tsx (link admin)
```

## Rollback (Se Necessário)

Caso precise reverter a migração:

```bash
# 1. Reverter última migração
npx prisma migrate resolve --rolled-back add_active_to_user

# 2. Remover campo do schema
# Editar prisma/schema.prisma e remover linha:
# active Boolean @default(true)

# 3. Criar nova migração
npx prisma migrate dev --name remove_active_from_user
```

## Produção

### Deploy da Migração

```bash
# Aplicar migração em produção
npx prisma migrate deploy

# Verificar status
npx prisma migrate status
```

### Variáveis de Ambiente

Certifique-se de que `DATABASE_URL` está configurada corretamente em produção.

## Suporte

Para documentação completa, consulte:
- `docs/GERENCIAMENTO_USUARIOS.md` - Documentação completa da funcionalidade
- Schema Prisma: `prisma/schema.prisma`

## Checklist Pós-Migração

- [ ] Migração aplicada com sucesso
- [ ] Cliente Prisma regenerado
- [ ] Login como admin funcionando
- [ ] Página `/admin/usuarios` acessível
- [ ] Link no menu visível para admin
- [ ] Ações de ativar/desativar funcionando
- [ ] Ações de alterar role funcionando
- [ ] Usuário inativo bloqueado no login
- [ ] Auto-proteção funcionando (admin não pode desativar-se)

## Observações Importantes

⚠️ **Atenção**: 
- A validação de status ativo ocorre apenas no login
- Usuários com sessão ativa continuam logados mesmo após desativação
- Para desconexão imediata, seria necessário implementar sistema de revogação de tokens (não incluído nesta versão)

✅ **Boas Práticas**:
- Usuários desativados mantêm seus dados no banco (soft delete)
- É possível reativar usuários desativados a qualquer momento
- Histórico de clientes, serviços e agendamentos é preservado

