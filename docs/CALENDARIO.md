# Módulo Calendário

## Descrição

O módulo Calendário oferece uma visualização temporal dos agendamentos, similar ao Google Calendar, permitindo navegação e criação rápida de agendamentos diretamente nos slots de horário.

## Funcionalidades

### 1. Modos de Visualização

- **Dia**: Exibe apenas o dia atual com slots de 30 minutos
- **3 Dias**: Visualização de 3 dias consecutivos
- **Semana**: Visualização semanal (segunda a domingo)
- **Mês**: Visualização mensal em grade

### 2. Slots de Tempo

- Intervalo: **30 minutos**
- Horário: 00:00 às 23:30 (48 slots por dia)
- Navegação: Anterior, Hoje, Próximo

### 3. Interações

#### Clicar em Slot Vazio
- Abre formulário de novo agendamento em popup
- Data e hora inicial pré-preenchidas com o slot selecionado
- Data e hora final ajustada para +30 minutos

#### Clicar em Agendamento Existente
- Abre popup com detalhes do agendamento:
  - Cliente (nome, email, telefone)
  - Data/hora início e fim
  - Serviços contratados
  - Valor total e duração
  - Status atual
  - Observações
- Botão "Editar" redireciona para página de agendamentos com o formulário pré-preenchido

### 4. Visualização de Agendamentos

#### Visualização Dia/Semana/3 Dias
- Agendamentos exibidos nos slots correspondentes
- Cor: Azul (#3B82F6)
- Informações exibidas: Nome do cliente e horário de início
- Suporte a múltiplos agendamentos no mesmo slot

#### Visualização Mês
- Até 3 agendamentos exibidos por dia
- Indicador de "+X mais" quando houver mais de 3 agendamentos
- Formato: HH:MM Nome do Cliente

### 5. Indicadores Visuais

- **Dia Atual**: Destacado em azul claro
- **Slots Vazios**: Hover cinza claro
- **Agendamentos**: Fundo azul com hover azul escuro

## Estrutura de Arquivos

```
src/
├── app/
│   └── calendario/
│       └── page.tsx                    # Página principal do calendário
├── components/
│   ├── calendario/
│   │   └── calendar-view.tsx          # Componente principal com visualizações
│   ├── agendamentos/
│   │   └── agendamento-dialog.tsx     # Popup de visualização de agendamento
│   └── ui/
│       └── dialog.tsx                  # Componente Dialog reutilizável
└── docs/
    └── CALENDARIO.md                   # Esta documentação
```

## Componentes

### CalendarView
Componente principal que gerencia as visualizações e navegação.

**Props:**
- `agendamentos`: Lista de agendamentos a exibir
- `onSlotClick`: Callback ao clicar em slot vazio
- `onAgendamentoClick`: Callback ao clicar em agendamento

**Sub-componentes:**
- `MonthView`: Renderiza visualização mensal
- `WeekDayView`: Renderiza visualizações de dia/3 dias/semana

### AgendamentoDialog
Popup para visualização de detalhes do agendamento.

**Props:**
- `agendamento`: Agendamento a exibir
- `open`: Estado de abertura do dialog
- `onOpenChange`: Callback para alterar estado

### Dialog (UI)
Componente de modal reutilizável.

**Componentes:**
- `Dialog`: Container principal
- `DialogContent`: Conteúdo com fundo branco
- `DialogHeader`: Cabeçalho com borda
- `DialogTitle`: Título do dialog
- `DialogDescription`: Descrição opcional
- `DialogBody`: Corpo do conteúdo
- `DialogFooter`: Rodapé com botões

## Integração

### Menu de Navegação
- Item "Calendário" adicionado ao menu principal
- Localização: Entre "Agendamentos" e botão "Sair"
- Rota: `/calendario`

### API
Utiliza as mesmas rotas existentes:
- `GET /api/agendamentos`: Busca todos os agendamentos
- `POST /api/agendamentos`: Cria novo agendamento
- `PUT /api/agendamentos/[id]`: Atualiza agendamento

## Fluxo de Uso

1. **Visualizar Agendamentos**
   - Acesse "Calendário" no menu
   - Escolha modo de visualização (Dia/3 Dias/Semana/Mês)
   - Navegue entre datas usando setas ou botão "Hoje"

2. **Criar Agendamento Rápido**
   - Clique em slot vazio
   - Preencha formulário (data/hora já preenchidas)
   - Salve

3. **Visualizar Detalhes**
   - Clique em agendamento existente
   - Veja detalhes no popup
   - Clique "Editar" para modificar

4. **Editar Agendamento**
   - No popup de detalhes, clique "Editar"
   - Redireciona para página de agendamentos
   - Formulário pré-preenchido com dados atuais

## Diferenças do Módulo Agendamentos

| Característica | Calendário | Agendamentos |
|----------------|-----------|--------------|
| Visualização | Temporal (grade) | Lista |
| Criação | Clique no slot | Botão "Adicionar" |
| Edição | Via popup → página | Diretamente na página |
| Foco | Visualização rápida | Gestão completa |
| Layout | Grade de horários | Duas colunas (form + lista) |

## Próximos Passos (Sugestões)

- [ ] Drag & drop para mover agendamentos
- [ ] Filtros por cliente ou serviço
- [ ] Exportar calendário (iCal/CSV)
- [ ] Notificações de conflitos em tempo real
- [ ] Integração com calendários externos
- [ ] Visualização de múltiplos profissionais lado a lado
- [ ] Cores personalizáveis por tipo de serviço ou cliente

## Notas Técnicas

- Usa React hooks (useState, useEffect, useMemo)
- Client-side rendering (`'use client'`)
- Responsivo (mobile-first)
- Timezone: Usa timezone local do navegador
- Performance: Memoização para cálculos de datas

