# Módulo de Agendamentos

## Visão Geral

O módulo de Agendamentos permite criar, gerenciar e visualizar agendamentos de serviços para clientes. Cada agendamento associa um cliente a um ou mais serviços, com controle de horários, valores e status.

## Funcionalidades

### 1. Criação de Agendamentos

- Seleção de cliente via combobox com busca
- Seleção múltipla de serviços via combobox com busca e filtro
- Cálculo automático de valor total (soma dos valores dos serviços)
- Cálculo automático de duração (soma do `time_execution` dos serviços)
- Cálculo automático do horário final (horário inicial + duração)
- Campos editáveis: valor, duração e horário final podem ser ajustados manualmente
- Controle de status: Pendente, Confirmado, Concluído, Cancelado
- Campo opcional de observações

### 2. Validação de Conflitos

- Antes de salvar, verifica se há sobreposição de horários com outros agendamentos
- Exclui agendamentos cancelados da verificação
- Exibe alerta detalhado em caso de conflito
- Permite confirmar agendamento mesmo com conflito via checkbox

### 3. Listagem e Gerenciamento

- Visualização de todos os agendamentos em cards
- Badge colorido por status:
  - **Pendente**: Amarelo
  - **Confirmado**: Azul
  - **Concluído**: Verde
  - **Cancelado**: Vermelho
- Informações exibidas:
  - Cliente (nome e email)
  - Data/hora início e fim
  - Duração formatada (ex: 1h 30min)
  - Lista de serviços com valores individuais
  - Valor total
  - Observações

### 4. Edição e Cancelamento

- Edição completa de agendamentos
- Botão para cancelar (altera status para CANCELADO)
- Botão para remover definitivamente
- Validação de conflitos também na edição

## Estrutura de Dados

### Model Agendamento (Prisma)

```prisma
model Agendamento {
  id              String               @id @default(cuid())
  clienteId       String
  cliente         Cliente              @relation(...)
  userId          String
  user            User                 @relation(...)
  dataHoraInicio  DateTime
  dataHoraFim     DateTime
  valorTotal      Decimal              @db.Decimal(10, 2)
  duracaoTotal    Int                  // em minutos
  status          StatusAgendamento    @default(PENDENTE)
  observacoes     String?              @db.Text
  servicos        AgendamentoServico[]
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
}
```

### Model AgendamentoServico (Tabela de Junção)

```prisma
model AgendamentoServico {
  id             String      @id @default(cuid())
  agendamentoId  String
  agendamento    Agendamento @relation(...)
  servicoId      String
  servico        Servico     @relation(...)
  valor          Decimal     @db.Decimal(10, 2)  // snapshot do valor
  timeExecution  Int                              // snapshot da duração
  createdAt      DateTime    @default(now())
}
```

**Importante**: A tabela de junção guarda um snapshot do valor e duração dos serviços no momento do agendamento. Isso evita que alterações posteriores nos serviços afetem agendamentos históricos.

## API Endpoints

### GET `/api/agendamentos`

Lista todos os agendamentos do usuário logado, com informações de cliente e serviços.

**Response:**
```json
[
  {
    "id": "...",
    "clienteId": "...",
    "cliente": {
      "id": "...",
      "nome": "João Silva",
      "email": "joao@email.com",
      "telemovel": "912345678"
    },
    "dataHoraInicio": "2026-01-10T14:00:00Z",
    "dataHoraFim": "2026-01-10T15:30:00Z",
    "valorTotal": "50.00",
    "duracaoTotal": 90,
    "status": "CONFIRMADO",
    "servicos": [
      {
        "id": "...",
        "servicoId": "...",
        "valor": "30.00",
        "timeExecution": 60,
        "servico": {
          "titulo": "Corte de Cabelo"
        }
      }
    ]
  }
]
```

### POST `/api/agendamentos`

Cria novo agendamento.

**Request Body:**
```json
{
  "clienteId": "...",
  "servicosIds": ["...", "..."],
  "dataHoraInicio": "2026-01-10T14:00:00Z",
  "dataHoraFim": "2026-01-10T15:30:00Z",
  "valorTotal": "50.00",
  "duracaoTotal": 90,
  "status": "PENDENTE",
  "observacoes": "Cliente preferencial",
  "confirmarConflito": false
}
```

**Validações:**
- Todos os campos obrigatórios preenchidos
- Cliente pertence ao usuário
- Todos os serviços pertencem ao usuário
- Data/hora início < fim
- Valor e duração > 0
- Verificação de conflitos (retorna erro 409 se houver)

**Response (Conflito - 409):**
```json
{
  "error": "Conflito de horário detectado",
  "conflitos": [
    {
      "id": "...",
      "dataHoraInicio": "2026-01-10T14:30:00Z",
      "dataHoraFim": "2026-01-10T15:30:00Z",
      "cliente": {
        "nome": "Maria Santos"
      }
    }
  ]
}
```

### PUT `/api/agendamentos/[id]`

Atualiza agendamento existente. Mesmas validações do POST.

### DELETE `/api/agendamentos/[id]`

Remove agendamento (com cascade para AgendamentoServico).

### GET `/api/agendamentos/conflitos`

Verifica conflitos de horário.

**Query Params:**
- `dataHoraInicio` (required)
- `dataHoraFim` (required)
- `excluirId` (optional) - ID do agendamento a excluir da busca (para edição)

**Response:**
```json
{
  "hasConflict": true,
  "conflitos": [...]
}
```

## Componentes

### `<AgendamentoForm />`

Formulário completo de criação/edição com:
- Combobox de busca para cliente
- Combobox de busca múltipla para serviços
- Cálculos automáticos
- Validação de conflitos
- Suporte a edição

**Props:**
```typescript
interface AgendamentoFormProps {
  onSuccess: () => void
  agendamentoInicial?: AgendamentoComRelacoes
  onCancel?: () => void
}
```

### `<AgendamentoList />`

Lista de agendamentos com:
- Cards informativos
- Badges de status
- Botões de ação (editar, cancelar, remover)

**Props:**
```typescript
interface AgendamentoListProps {
  agendamentos: AgendamentoComRelacoes[]
  onAgendamentoUpdated: () => void
  onEdit: (agendamento: AgendamentoComRelacoes) => void
}
```

### `<Combobox />`

Componente reutilizável de busca/seleção:
- Suporta single e multi-select
- Filtro em tempo real
- Remoção de itens selecionados

**Props:**
```typescript
interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
  emptyMessage?: string
}
```

## Utilitários

### `date-utils.ts`

Funções auxiliares:
- `adicionarMinutos(data, minutos)`: adiciona minutos a uma data
- `horariosSeConflitam(inicio1, fim1, inicio2, fim2)`: verifica sobreposição
- `formatarDataHora(data)`: formata para exibição pt-BR
- `formatarDuracao(minutos)`: converte minutos para "Xh Ymin"
- `converterParaDateTimeLocal(data)`: converte para formato input datetime-local

## Fluxo de Uso

1. **Criar Agendamento**
   - Usuário acessa `/agendamentos`
   - Clica em "Adicionar Novo Agendamento"
   - Seleciona cliente
   - Seleciona um ou mais serviços
   - Sistema calcula automaticamente valor, duração e horário final
   - Usuário pode ajustar valores se necessário
   - Define horário de início
   - Adiciona observações (opcional)
   - Ao submeter, sistema verifica conflitos
   - Se houver conflito, exibe alerta e permite confirmar
   - Agendamento criado com sucesso

2. **Editar Agendamento**
   - Usuário clica em "Editar" no card do agendamento
   - Formulário é preenchido com dados atuais
   - Usuário faz alterações
   - Sistema valida conflitos (excluindo o próprio agendamento)
   - Atualização bem-sucedida

3. **Cancelar Agendamento**
   - Usuário clica em "Cancelar" no card
   - Status muda para CANCELADO
   - Agendamento não é mais considerado em verificações de conflito

4. **Remover Agendamento**
   - Usuário clica em "Remover" no card
   - Confirma ação
   - Agendamento e seus serviços são deletados permanentemente

## Melhorias Futuras

- [ ] Visualização de calendário
- [ ] Notificações de agendamentos próximos
- [ ] Exportação de relatórios
- [ ] Filtros avançados (por status, período, cliente)
- [ ] Busca de agendamentos
- [ ] Integração com calendário externo (Google Calendar, etc)
- [ ] Cálculo automático de disponibilidade
- [ ] Sugestão de horários disponíveis
- [ ] Recorrência de agendamentos

