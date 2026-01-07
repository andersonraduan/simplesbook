# Módulo de Serviços

## Visão Geral

Módulo para gerenciamento de serviços associados ao usuário logado, com valores em Euros (€).

## Estrutura

### Database (Prisma)

**Model Servico:**
- `id`: String (cuid)
- `titulo`: String
- `descricao`: Text (campo longo)
- `valor`: Decimal(10,2) - valores monetários em Euros
- `timeExecution`: Int - tempo de execução em minutos (campo: time_execution no DB)
- `userId`: String (relacionamento com User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### API Routes

**GET /api/servicos**
- Lista todos os serviços do usuário logado
- Requer autenticação
- Retorna array de serviços ordenados por data de criação
- Valores convertidos para string para serialização JSON

**POST /api/servicos**
- Cria novo serviço associado ao usuário logado
- Requer autenticação
- Body: `{ titulo, descricao, valor, timeExecution }`
- Validações: campos obrigatórios, valor > 0, timeExecution > 0

**GET /api/servicos/[id]**
- Busca serviço específico
- Requer autenticação
- Valida se o serviço pertence ao usuário

**PUT /api/servicos/[id]**
- Atualiza serviço existente
- Requer autenticação
- Valida propriedade do serviço
- Validações: valor > 0, timeExecution > 0

**DELETE /api/servicos/[id]**
- Remove serviço
- Requer autenticação
- Valida propriedade do serviço

### Páginas e Componentes

**Página: /servicos**
- Interface principal para gerenciar serviços
- Layout em duas colunas (formulário + lista)
- Protegida por autenticação

**Componentes:**
- `servico-form.tsx`: Formulário de criação/edição
  - Campo Título (text)
  - Campo Descrição (textarea)
  - Campo Valor (number com step 0.01)
  - Campo Tempo de Execução (number em minutos)
  - Suporta modo criar/editar
- `servico-list.tsx`: Lista de serviços com ações
  - Formatação de valores em Euros (€)
  - Formatação de duração (30 min, 1h 30min, etc.)
  - Botões Editar e Remover

## Formatação de Moeda

Valores são formatados usando `Intl.NumberFormat`:

```javascript
new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
}).format(valor)
```

Resultado: `€ 10,50`

## Segurança

- Todas as rotas protegidas por autenticação NextAuth
- Serviços sempre associados ao usuário logado
- Validação de propriedade em todas as operações
- Cascade delete: serviços removidos ao deletar usuário
- Validação de valores positivos (> 0)

## Conversão Decimal

O Prisma usa `Decimal` para precisão monetária. As conversões são:

- **API → Frontend**: `servico.valor.toString()` (string)
- **Frontend → API**: `parseFloat(formData.valor)` → `new Decimal(valor)`

## Como Usar

1. Aplicar migração do banco:

```bash
npm run db:push
```

2. Acessar via dashboard: `/dashboard` → "Meus Serviços"
3. Ou acessar diretamente: `/servicos`

## Navegação

Menu principal atualizado:
- Home | Clientes | **Serviços**

## Tempo de Execução

O campo `timeExecution` armazena o tempo estimado em **minutos** para execução do serviço.

**Exemplos de formatação:**
- 30 minutos → `30 min`
- 60 minutos → `1h`
- 90 minutos → `1h 30min`
- 120 minutos → `2h`

Esta informação é útil para:
- Planejamento de agendamentos
- Cálculo de disponibilidade
- Estimativa de horários
- Organização da agenda

## Próximos Passos

- [ ] Adicionar categorias de serviços
- [ ] Implementar busca/filtro de serviços
- [ ] Adicionar paginação para muitos serviços
- [ ] Exportar lista de serviços (CSV/PDF)
- [ ] Vincular serviços a agendamentos
- [ ] Adicionar imagens aos serviços
- [ ] Histórico de alterações de preços
- [ ] Permitir tempo variável (mínimo/máximo)

