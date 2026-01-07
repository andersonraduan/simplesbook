# Sistema de Notificações Twilio

Sistema completo de notificações via SMS e WhatsApp integrado ao SimplesBook.

## Funcionalidades

- ✅ Envio de SMS via Twilio
- ✅ Envio de WhatsApp via Twilio
- ✅ Templates personalizáveis por usuário
- ✅ Variáveis dinâmicas nos templates
- ✅ Agendamento automático de notificações
- ✅ Lembretes configuráveis (24h antes, 1h antes, etc)
- ✅ Notificações de confirmação, cancelamento e mudança de status
- ✅ Controle individual por canal (SMS/WhatsApp)
- ✅ Histórico de notificações enviadas
- ✅ Sistema de retry automático (até 3 tentativas)
- ✅ Limpeza automática de logs antigos (90 dias)

## Configuração

### 1. Variáveis de Ambiente

As credenciais Twilio já estão configuradas no `.env`:

```env
TWILIO_ACCOUNT_SID=ACa31473cb917037a86442149c72bc77b9
TWILIO_AUTH_TOKEN=ad26dc9ce4e65824122a038b5d4a3758
TWILIO_PHONE_NUMBER=+12524276007
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_WHATSAPP_NOTIFICATIONS=true
```

**Opcional** - Para proteger o endpoint do cron:
```env
CRON_SECRET=seu_token_secreto_aqui
```

### 2. Banco de Dados

Execute as migrações para criar as tabelas:

```bash
npm run db:migrate
```

Ou sincronize o schema (desenvolvimento):

```bash
npm run db:push
```

Execute o seed para criar templates padrão:

```bash
npm run db:seed
```

### 3. Job de Disparo (Cron)

#### Desenvolvimento Local

Para testar localmente, chame manualmente:

```bash
curl http://localhost:3000/api/notifications/cron
```

#### Produção (Vercel)

O arquivo `vercel.json` já está configurado para executar o job a cada 10 minutos automaticamente.

#### Outras Plataformas

Configure um cron job externo para chamar:
```
GET https://seu-dominio.com/api/notifications/cron
```

Se configurou `CRON_SECRET`, adicione header:
```
Authorization: Bearer seu_token_secreto_aqui
```

## Estrutura do Banco

### NotificationTemplate
Templates de notificação configuráveis por usuário.

**Campos principais:**
- `tipo`: CONFIRMACAO | LEMBRETE | DIA_DO_AGENDAMENTO | CANCELAMENTO | MUDANCA_STATUS
- `intervaloMinutos`: null (imediato) ou número de minutos antes do agendamento
- `mensagemSMS`: Template da mensagem SMS
- `mensagemWhatsApp`: Template da mensagem WhatsApp
- `habilitarSMS`: Habilita envio por SMS
- `habilitarWhatsApp`: Habilita envio por WhatsApp
- `ativo`: Template ativo/inativo

### NotificationScheduled
Notificações agendadas para envio futuro.

**Campos principais:**
- `agendamentoId`: Referência ao agendamento
- `templateId`: Template usado
- `canal`: SMS | WHATSAPP
- `destinatario`: Número de telefone
- `mensagem`: Mensagem processada (com variáveis substituídas)
- `dataHoraAgendada`: Quando deve ser enviada
- `status`: PENDENTE | ENVIADA | FALHA | CANCELADA
- `tentativas`: Contador de tentativas de envio

### NotificationLog
Histórico de notificações enviadas (últimos 90 dias).

## Variáveis de Template

Variáveis disponíveis para usar nas mensagens:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{cliente_nome}` | Nome do cliente | João Silva |
| `{cliente_telefone}` | Telefone do cliente | +5511999999999 |
| `{data}` | Data do agendamento | 15/01/2026 |
| `{hora}` | Hora do agendamento | 14:30 |
| `{servicos}` | Lista de serviços | Corte (€50,00), Barba (€30,00) |
| `{valor_total}` | Valor total | €80,00 |
| `{duracao_total}` | Duração total | 1h30min |
| `{estabelecimento_nome}` | Nome do estabelecimento | Barbearia XYZ |
| `{observacoes}` | Observações | Cliente prefere tesoura |

### Exemplo de Template

**SMS:**
```
Olá {cliente_nome}! Seu agendamento foi confirmado para {data} às {hora}. Total: {valor_total}.
```

**WhatsApp:**
```
✅ *Agendamento Confirmado*

Olá {cliente_nome}!

📅 Data: {data}
🕐 Hora: {hora}
💼 Serviços: {servicos}
💰 Total: {valor_total}

Até breve!
```

## Fluxo de Notificações

### 1. Criação de Agendamento

Quando um agendamento é criado:

1. Sistema busca templates ativos do usuário
2. Para cada template, cria registros em `NotificationScheduled`
3. Calcula `dataHoraAgendada` baseado no `intervaloMinutos`
4. Processa template substituindo variáveis
5. Cria notificações separadas para SMS e WhatsApp (se habilitados)

**Tipos criados automaticamente:**
- CONFIRMACAO (imediato)
- LEMBRETE (conforme templates configurados)
- DIA_DO_AGENDAMENTO (conforme templates configurados)

### 2. Job de Disparo (Cron)

A cada 10 minutos:

1. Busca notificações com status PENDENTE e `dataHoraAgendada <= agora`
2. Verifica se agendamento não foi cancelado
3. Envia via Twilio (SMS ou WhatsApp)
4. Se sucesso:
   - Atualiza status para ENVIADA
   - Registra em NotificationLog
5. Se falha:
   - Incrementa tentativas
   - Se < 3 tentativas: mantém PENDENTE para retry
   - Se >= 3 tentativas: marca como FALHA
6. Limpa logs com mais de 90 dias

### 3. Atualização de Agendamento

**Mudança de status:**
- Envia notificação MUDANCA_STATUS (se habilitada)

**Cancelamento:**
- Cancela notificações pendentes
- Envia notificação CANCELAMENTO

**Mudança de data/hora:**
- Cancela notificações pendentes antigas
- Cria novas notificações com novos horários

### 4. Exclusão de Agendamento

- Cancela todas notificações pendentes
- Mantém histórico em NotificationLog

## API Endpoints

### Templates

**GET /api/notifications/templates**
Lista templates do usuário logado.

**POST /api/notifications/templates**
Cria novo template.

Body:
```json
{
  "tipo": "LEMBRETE",
  "nome": "Lembrete 2 horas antes",
  "intervaloMinutos": 120,
  "mensagemSMS": "Lembrete: seu agendamento é às {hora}.",
  "mensagemWhatsApp": "⏰ Seu agendamento é às {hora}!",
  "habilitarSMS": true,
  "habilitarWhatsApp": true,
  "ativo": true
}
```

**PUT /api/notifications/templates/:id**
Atualiza template existente.

**DELETE /api/notifications/templates/:id**
Remove template (apenas se não houver notificações pendentes).

### Teste

**GET /api/notifications/test**
Verifica status da configuração Twilio.

**POST /api/notifications/test**
Envia mensagem de teste.

Body:
```json
{
  "canal": "SMS",
  "destinatario": "+5511999999999",
  "mensagem": "Teste de notificação"
}
```

### Cron

**GET /api/notifications/cron**
Processa notificações pendentes (chamado automaticamente pelo cron).

## Interface Web

Acesse `/notifications` para gerenciar templates:

- ✅ Listar templates existentes
- ✅ Criar novo template
- ✅ Editar template
- ✅ Excluir template
- ✅ Ativar/desativar template
- ✅ Preview de variáveis disponíveis
- ✅ Inserir variáveis com um clique
- ✅ Status da configuração Twilio

## Boas Práticas

### Templates

1. **Seja conciso no SMS** (limite de 160 caracteres por segmento)
2. **Use emojis no WhatsApp** para melhor visualização
3. **Teste antes de ativar** usando o endpoint de teste
4. **Não exagere nos lembretes** (1-2 são suficientes)

### Intervalos Recomendados

- **Confirmação**: Imediato (0 minutos)
- **Lembrete principal**: 24 horas antes (1440 minutos)
- **Lembrete secundário**: 1 hora antes (60 minutos)
- **Dia do agendamento**: 1 hora antes (60 minutos)

### Custos

- **SMS**: ~$0.01 por mensagem (varia por país)
- **WhatsApp**: ~$0.005 por mensagem
- Monitore uso no dashboard Twilio

### Números de Telefone

- Use formato internacional: `+5511999999999`
- Sistema formata automaticamente números brasileiros
- Valide números no cadastro de clientes

## Troubleshooting

### Notificações não estão sendo enviadas

1. Verifique variáveis de ambiente no `.env`
2. Teste configuração: `GET /api/notifications/test`
3. Verifique logs do cron: `GET /api/notifications/cron`
4. Confirme que templates estão ativos
5. Verifique saldo/créditos na conta Twilio

### Mensagens com erro

1. Verifique formato do número de telefone
2. Confirme que número está ativo
3. Para WhatsApp: número precisa ter opt-in (aceite prévio)
4. Veja erro em `NotificationScheduled.erroMensagem`

### Templates não aparecem

1. Confirme que estão associados ao usuário correto
2. Execute seed: `npm run db:seed`
3. Verifique filtro de tipo na interface

### Cron não executa

**Desenvolvimento:**
- Chame manualmente: `curl http://localhost:3000/api/notifications/cron`

**Vercel:**
- Verifique logs no dashboard Vercel
- Confirme que `vercel.json` está commitado
- Crons só funcionam em planos Pro ou superior

**Alternativa:**
- Use serviço externo como cron-job.org
- Configure webhook para chamar o endpoint

## Próximos Passos

Melhorias futuras sugeridas:

- [ ] Dashboard de estatísticas de envio
- [ ] Filtros avançados no histórico
- [ ] Templates globais (admin)
- [ ] Suporte a anexos (imagens no WhatsApp)
- [ ] Integração com outros provedores (SendGrid, etc)
- [ ] Notificações para o prestador de serviço
- [ ] Confirmação de leitura (WhatsApp)
- [ ] A/B testing de templates
- [ ] Segmentação de clientes
- [ ] Agendamento manual de notificações

## Suporte

Para dúvidas sobre:
- **Twilio**: https://www.twilio.com/docs
- **SimplesBook**: Consulte documentação em `/docs`

