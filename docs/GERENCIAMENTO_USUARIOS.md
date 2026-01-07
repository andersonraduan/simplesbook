# Gerenciamento de Usuários

## Visão Geral

Módulo de administração que permite aos usuários ADMIN gerenciar todos os usuários do sistema, incluindo ativação/desativação de contas e alteração de permissões.

## Funcionalidades

### 1. Listagem de Usuários

- Exibe todos os usuários do sistema
- Mostra informações detalhadas: nome, email, role, status (ativo/inativo)
- Exibe contadores de clientes, serviços e agendamentos por usuário
- Data de cadastro

### 2. Filtros e Busca

- **Busca textual**: por nome ou email
- **Filtro por status**: todos, ativos ou inativos
- **Filtro por role**: todos, admins ou usuários

### 3. Estatísticas

Painel com métricas em tempo real:
- Total de usuários
- Usuários ativos
- Usuários inativos
- Total de administradores

### 4. Ações de Gerenciamento

#### Ativar/Desativar Usuário
- Administradores podem ativar ou desativar qualquer usuário
- Usuários inativos não conseguem fazer login no sistema
- Proteção: admin não pode desativar a própria conta

#### Alterar Permissão (Role)
- Promover usuário comum para ADMIN
- Rebaixar ADMIN para usuário comum
- Alteração instantânea de permissões

## Modelo de Dados

### Campo Adicionado ao User

```prisma
model User {
  // ... campos existentes
  active                Boolean                @default(true)
  // ... demais campos
}
```

**Detalhes**:
- **Tipo**: Boolean
- **Valor padrão**: `true`
- **Descrição**: Define se o usuário está ativo no sistema

## Segurança

### Autenticação
- Apenas usuários com role `ADMIN` podem acessar o módulo
- Verificação em nível de rota (server-side)
- Verificação em nível de API

### Proteções Implementadas
1. **Auto-proteção**: Admin não pode desativar ou deletar a própria conta
2. **Validação de sessão**: Usuários inativos são automaticamente deslogados
3. **Bloqueio de login**: Usuários inativos não conseguem autenticar

### Fluxo de Verificação de Status

```typescript
1. Login → Verifica se user.active === true
2. Se inativo → Login bloqueado com mensagem de erro
3. Sessão ativa → Permanece válida até expirar ou logout
```

**Nota**: A validação ocorre apenas no login. Usuários com sessão ativa continuam logados mesmo se desativados posteriormente. Para forçar logout imediato, seria necessário:
- Implementar validação via API com revalidação periódica
- Usar solução de cache (Redis) para verificação de status
- Implementar sistema de revogação de tokens

## Endpoints da API

### GET /api/admin/users
Lista todos os usuários do sistema.

**Resposta**:
```json
{
  "users": [
    {
      "id": "...",
      "email": "user@example.com",
      "name": "Nome do Usuário",
      "role": "USER|ADMIN",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "clientes": 10,
        "servicos": 5,
        "agendamentos": 25
      }
    }
  ]
}
```

### PATCH /api/admin/users/[id]
Atualiza informações de um usuário.

**Body**:
```json
{
  "active": true|false,  // opcional
  "role": "USER|ADMIN",  // opcional
  "name": "Novo Nome"    // opcional
}
```

**Resposta**:
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "role": "USER",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/admin/users/[id]
Remove um usuário (soft delete - apenas desativa).

**Resposta**:
```json
{
  "message": "Usuário desativado com sucesso"
}
```

## Interface do Usuário

### Rota
`/admin/usuarios`

### Componentes

#### 1. UserManagementClient
- **Localização**: `src/app/admin/usuarios/user-management-client.tsx`
- **Responsabilidades**: 
  - Buscar e filtrar usuários
  - Gerenciar estado de filtros
  - Exibir estatísticas

#### 2. UserList
- **Localização**: `src/components/admin/user-list.tsx`
- **Responsabilidades**:
  - Renderizar lista de usuários
  - Executar ações (ativar/desativar, alterar role)
  - Feedback visual de status

### Layout
- Cards individuais por usuário
- Badges visuais para status e role
- Botões de ação contextuais
- Estatísticas no topo da página

## Navegação

O link "Gerenciar Usuários" aparece no menu principal **apenas para administradores**.

**Implementação**:
```typescript
// src/components/layout/app-nav.tsx
const adminLinks = [
  { href: '/admin/usuarios', label: 'Gerenciar Usuários' },
]

const allLinks = session?.user?.role === 'ADMIN' 
  ? [...navLinks, ...adminLinks]
  : navLinks
```

## Migração do Banco de Dados

### Executar Migração

```bash
npx prisma migrate dev --name add_active_to_user
```

### Gerar Cliente Prisma

```bash
npx prisma generate
```

### Atualizar Banco em Produção

```bash
npx prisma migrate deploy
```

## Casos de Uso

### 1. Desativar Usuário Inativo
**Cenário**: Usuário não utiliza mais o sistema ou violou termos de uso.

**Fluxo**:
1. Admin acessa `/admin/usuarios`
2. Localiza o usuário na lista
3. Clica em "Desativar"
4. Confirma a ação
5. Usuário é imediatamente desconectado (se logado)

### 2. Promover Usuário a Admin
**Cenário**: Dar permissões administrativas a um usuário confiável.

**Fluxo**:
1. Admin acessa `/admin/usuarios`
2. Localiza o usuário
3. Clica em "Tornar Admin"
4. Confirma a ação
5. Usuário ganha acesso imediato aos recursos admin

### 3. Reativar Usuário
**Cenário**: Reativar conta previamente desativada.

**Fluxo**:
1. Admin acessa `/admin/usuarios`
2. Filtra por "Inativos"
3. Localiza o usuário
4. Clica em "Ativar"
5. Usuário pode fazer login novamente

## Testes

### Teste Manual

1. **Login como Admin**
   - Acessar `/admin/usuarios`
   - Verificar listagem completa

2. **Desativar Usuário**
   - Desativar um usuário teste
   - Tentar fazer login com esse usuário
   - Validar mensagem de erro

3. **Reativar Usuário**
   - Reativar usuário
   - Fazer login com sucesso

4. **Alterar Role**
   - Promover usuário para admin
   - Verificar acesso ao menu admin
   - Rebaixar para user
   - Verificar que menu admin desaparece

5. **Auto-proteção**
   - Tentar desativar própria conta
   - Validar que ação é bloqueada

## Melhorias Futuras

- [ ] Log de auditoria de alterações em usuários
- [ ] Filtro por data de cadastro
- [ ] Exportação de lista de usuários (CSV/Excel)
- [ ] Notificação por email ao desativar conta
- [ ] Histórico de ações administrativas
- [ ] Paginação para grandes volumes de usuários
- [ ] Edição inline de nome de usuário
- [ ] Reset de senha por admin
- [ ] Múltipla seleção para ações em lote

## Observações Importantes

1. **Soft Delete**: A desativação de usuários é um soft delete. Os dados não são removidos do banco, apenas o campo `active` é marcado como `false`.

2. **Sessões Ativas**: Quando um usuário é desativado, ele não consegue fazer login novamente, mas sessões já ativas permanecem válidas até expirar naturalmente ou logout manual. Para implementar desconexão imediata, seria necessário um sistema de revogação de tokens (fora do escopo atual).

3. **Migração Retroativa**: Todos os usuários existentes receberão automaticamente `active = true` pela migration.

4. **Performance**: A validação de status ativo ocorre apenas no login, sem impacto de performance nas requisições subsequentes.

