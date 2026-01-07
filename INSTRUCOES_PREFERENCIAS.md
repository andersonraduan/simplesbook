# Instruções - Sistema de Preferências do Usuário

## ✅ Implementação Concluída

O sistema de preferências do calendário foi implementado com sucesso! Agora os usuários podem personalizar:

- **Visualização do Calendário**: Escolher entre Dia, 3 Dias, Semana ou Mês
- **Horário de Atendimento**: Definir horário de início e fim do expediente
- **Intervalo de Slots**: Configurar intervalos de 15, 30 ou 60 minutos

## 📋 Próximos Passos

### 1. Aplicar Migração do Banco de Dados

Execute o seguinte comando no terminal **fora do Cursor** (em um terminal normal):

```bash
cd C:\Users\ander\Desktop\simplesbook
npx prisma migrate dev --name add_user_preferences
```

Este comando irá:
- Criar a tabela `UserPreferences` no banco de dados
- Adicionar o enum `CalendarioView`
- Estabelecer a relação 1:1 com a tabela `User`

### 2. Gerar Cliente Prisma Atualizado

Após a migração, execute:

```bash
npx prisma generate
```

### 3. (Opcional) Popular Preferências Padrão

Se quiser criar preferências padrão para usuários existentes, execute o seed:

```bash
npx prisma db seed
```

## 🎨 Como Usar

### Acessar Configurações

1. Faça login na aplicação
2. Clique em **"Configurações"** no menu de navegação
3. Configure suas preferências:
   - Escolha a visualização padrão do calendário
   - Defina seu horário de atendimento
   - Selecione o intervalo entre os horários

### Visualizar no Calendário

Ao acessar o **Calendário**, as seguintes preferências serão aplicadas automaticamente:

- ✅ A visualização inicial será baseada na sua preferência (Dia/3 Dias/Semana/Mês)
- ✅ Os horários exibidos respeitarão o intervalo de atendimento configurado
- ✅ Os slots serão divididos conforme o intervalo escolhido (15/30/60 min)

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/app/api/user/preferences/route.ts` - API para gerenciar preferências
- `src/components/preferences/preferences-form.tsx` - Formulário de preferências
- `src/app/configuracoes/page.tsx` - Página de configurações
- `src/types/preferences.ts` - Tipos TypeScript para preferências

### Arquivos Modificados:
- `prisma/schema.prisma` - Adicionado model `UserPreferences` e enum `CalendarioView`
- `src/app/calendario/page.tsx` - Integração com preferências do usuário
- `src/components/calendario/calendar-view.tsx` - Suporte a preferências dinâmicas
- `src/components/layout/user-nav.tsx` - Link para Configurações
- `src/middleware.ts` - Proteção da rota `/configuracoes`
- `prisma/seed.ts` - Criação de preferências padrão

## 🔧 Funcionalidades Implementadas

### Backend (API)
- ✅ GET `/api/user/preferences` - Buscar preferências (cria padrão se não existir)
- ✅ PUT `/api/user/preferences` - Atualizar preferências
- ✅ Validações de horário e intervalo
- ✅ Valores padrão sensatos

### Frontend
- ✅ Página de configurações em `/configuracoes`
- ✅ Formulário intuitivo com validação
- ✅ Integração com o calendário
- ✅ Link no menu de navegação

### Banco de Dados
- ✅ Model `UserPreferences` com relação 1:1 com `User`
- ✅ Enum `CalendarioView` para tipos de visualização
- ✅ Seed atualizado para criar preferências padrão

## 📊 Schema do Banco

```prisma
model UserPreferences {
  id                         String          @id @default(cuid())
  userId                     String          @unique
  user                       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  calendarioView             CalendarioView  @default(SEMANA)
  horarioInicioAtendimento   String          @default("08:00")
  horarioFimAtendimento      String          @default("20:00")
  intervaloSlot              Int             @default(30)
  createdAt                  DateTime        @default(now())
  updatedAt                  DateTime        @updatedAt

  @@index([userId])
}

enum CalendarioView {
  DIA
  TRES_DIAS
  SEMANA
  MES
}
```

## 🎯 Valores Padrão

- **Visualização**: Semana
- **Horário de Início**: 08:00
- **Horário de Fim**: 20:00
- **Intervalo de Slot**: 30 minutos

## ✨ Benefícios

- ✅ Cada usuário tem suas próprias configurações personalizadas
- ✅ Configurações persistem entre sessões
- ✅ Horário de trabalho personalizado para cada profissional
- ✅ Melhor UX - calendário se adapta ao uso de cada um
- ✅ Validação robusta para evitar configurações inválidas

## 🚀 Pronto para Usar!

Após executar as migrações, o sistema está completamente funcional e pronto para uso.

