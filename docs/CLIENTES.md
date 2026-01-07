# Módulo de Clientes

## Visão Geral

Módulo para gerenciamento de clientes associados ao usuário logado.

## Estrutura

### Database (Prisma)

**Model Cliente:**
- `id`: String (cuid)
- `nome`: String
- `email`: String
- `telemovel`: String
- `dataNascimento`: DateTime
- `userId`: String (relacionamento com User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### API Routes

**GET /api/clientes**
- Lista todos os clientes do usuário logado
- Requer autenticação
- Retorna array de clientes ordenados por data de criação

**POST /api/clientes**
- Cria novo cliente associado ao usuário logado
- Requer autenticação
- Body: `{ nome, email, telemovel, dataNascimento }`

**GET /api/clientes/[id]**
- Busca cliente específico
- Requer autenticação
- Valida se o cliente pertence ao usuário

**PUT /api/clientes/[id]**
- Atualiza cliente existente
- Requer autenticação
- Valida propriedade do cliente

**DELETE /api/clientes/[id]**
- Remove cliente
- Requer autenticação
- Valida propriedade do cliente

### Páginas e Componentes

**Página: /clientes**
- Interface principal para gerenciar clientes
- Layout em duas colunas (formulário + lista)
- Protegida por autenticação

**Componentes:**
- `cliente-form.tsx`: Formulário de criação/edição
- `cliente-list.tsx`: Lista de clientes com ações

## Segurança

- Todas as rotas protegidas por autenticação NextAuth
- Clientes sempre associados ao usuário logado
- Validação de propriedade em todas as operações
- Cascade delete: clientes removidos ao deletar usuário

## Como Usar

1. Executar migração do banco:
```bash
npm run db:push
```

2. Acessar via dashboard: `/dashboard` → "Meus Clientes"
3. Ou acessar diretamente: `/clientes`

## Próximos Passos

- [ ] Adicionar validação de email e telefone
- [ ] Implementar busca/filtro de clientes
- [ ] Adicionar paginação para muitos clientes
- [ ] Exportar lista de clientes (CSV/PDF)
- [ ] Histórico de interações com clientes

